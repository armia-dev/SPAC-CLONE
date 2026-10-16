"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Calendar, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n) => String(n).padStart(2, "0");

const toMinutes = (hhmm) => {
  const [h, mm] = hhmm.split(":").map(Number);
  return h * 60 + mm;
};

const formatLabel = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${h % 12 || 12}:${pad(mm)} ${h >= 12 ? "PM" : "AM"}`;
};

// 30-minute slots from the opening time up to (and including) the closing time.
// value = "HH:mm" (24h), label = "6:00 AM"
function buildTimeSlots(opening, closing) {
  let start = toMinutes(opening);
  let end = toMinutes(closing);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    start = 6 * 60; // fall back to 6:00 AM – 10:00 PM
    end = 22 * 60;
  }
  const slots = [];
  for (let t = start; t <= end; t += 30) {
    slots.push({
      value: `${pad(Math.floor(t / 60))}:${pad(t % 60)}`,
      label: formatLabel(t),
    });
  }
  // Make sure the exact closing time is selectable even if it isn't on a 30-min step
  if (slots[slots.length - 1].value !== `${pad(Math.floor(end / 60))}:${pad(end % 60)}`) {
    slots.push({
      value: `${pad(Math.floor(end / 60))}:${pad(end % 60)}`,
      label: formatLabel(end),
    });
  }
  return slots;
}

const REASON_PRESETS = ["Maintenance", "Weather / Rain", "Renovation", "Custom"];

/**
 * Popup for adding an unavailable (blocked) schedule.
 *
 * Props:
 *  - isOpen:  boolean
 *  - onClose: () => void
 *  - openingTime / closingTime: "HH:mm" operating hours; the start and end
 *             time options are limited to this range (default 06:00 – 22:00)
 *  - onSave:  ({ date, startTime, endTime, reason }) => void
 *             date is "yyyy-mm-dd", times are "HH:mm" (24h), reason is a string
 */
export default function SettingsPageAddUnavailableSched({
  isOpen = true,
  onClose,
  onSave,
  openingTime = "06:00",
  closingTime = "22:00",
}) {
  const today = new Date();
  // Midnight today: dates before this are not selectable
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Date
  const [selectedDate, setSelectedDate] = useState(null); // { year, month, dayNumber }
  const [dateDisplay, setDateDisplay] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Times
  const [startTime, setStartTime] = useState("");
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [endTime, setEndTime] = useState("");
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  // Reason
  const [selectedReason, setSelectedReason] = useState("Maintenance");
  const [reason, setReason] = useState("Maintenance");

  const [error, setError] = useState("");

  const datePickerRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  // Reset the form each time the popup opens
  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    setSelectedDate(null);
    setDateDisplay("");
    setIsDatePickerOpen(false);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setStartTime("");
    setEndTime("");
    setIsStartTimeOpen(false);
    setIsEndTimeOpen(false);
    setSelectedReason("Maintenance");
    setReason("Maintenance");
    setError("");
  }, [isOpen]);

  // Close dropdowns on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
      if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
        setIsStartTimeOpen(false);
      }
      if (endTimeRef.current && !endTimeRef.current.contains(event.target)) {
        setIsEndTimeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape + lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  // Calendar grid (42 cells)
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ dayNumber: daysInPrevMonth - i, month: viewMonth - 1, year: viewYear, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({ dayNumber: i, month: viewMonth, year: viewYear, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ dayNumber: i, month: viewMonth + 1, year: viewYear, isCurrentMonth: false });
    }
    return days;
  }, [viewYear, viewMonth]);

  const timeSlots = useMemo(
    () => buildTimeSlots(openingTime, closingTime),
    [openingTime, closingTime]
  );
  // A booking must start before closing and end after opening
  const startSlots = timeSlots.slice(0, -1);
  const endSlots = timeSlots.slice(1);
  const rangeLabel = `${timeSlots[0].label} – ${timeSlots[timeSlots.length - 1].label}`;

  // True when the calendar is showing the current month (can't go back further)
  const isCurrentViewMonth =
    viewYear === todayStart.getFullYear() && viewMonth === todayStart.getMonth();

  if (!isOpen) return null;

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (isCurrentViewMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dayObj) => {
    // Normalize filler days from the previous/next month
    const real = new Date(dayObj.year, dayObj.month, dayObj.dayNumber);
    // Safety net: never allow a past date
    if (real < todayStart) return;
    const picked = { year: real.getFullYear(), month: real.getMonth(), dayNumber: real.getDate() };
    setSelectedDate(picked);
    setDateDisplay(`${pad(picked.dayNumber)}/${pad(picked.month + 1)}/${picked.year}`);
    setViewYear(picked.year);
    setViewMonth(picked.month);
    setIsDatePickerOpen(false);
  };

  const handleClearDate = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    setDateDisplay("");
    setIsDatePickerOpen(false);
  };

  const handleTodayDate = (e) => {
    e.stopPropagation();
    const now = new Date();
    handleSelectDay({ year: now.getFullYear(), month: now.getMonth(), dayNumber: now.getDate() });
  };

  const labelFor = (value) => timeSlots.find((s) => s.value === value)?.label || "";

  const pickReason = (preset) => {
    setSelectedReason(preset);
    setReason(preset === "Custom" ? "" : preset);
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setReason(value);
    setSelectedReason(REASON_PRESETS.includes(value) && value !== "Custom" ? value : "Custom");
  };

  const handleSave = () => {
    if (!selectedDate) return setError("Pick a date.");
    if (!startTime || !endTime) return setError("Set a start and end time.");
    if (endTime <= startTime) return setError("End time must be after the start time.");
    if (!reason.trim()) return setError("Add a reason.");

    setError("");
    onSave?.({
      date: `${selectedDate.year}-${pad(selectedDate.month + 1)}-${pad(selectedDate.dayNumber)}`,
      startTime,
      endTime,
      reason: reason.trim(),
    });
    onClose?.();
  };

  // Shared styles (same tokens as the Add Court Rental modal)
  const panel = "bg-[#fbfaf1] border border-[#dedbc4] rounded-xl p-2.5 sm:p-3";
  const label = "block text-[11px] font-semibold text-[#121212] mb-1";
  const fieldButton =
    "w-full h-7.5 sm:h-8 pl-3 pr-2.5 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer";

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex overflow-y-auto p-2.5 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-unavailable-title"
        className="m-auto w-full max-w-[500px] sm:max-w-[520px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-2xl p-3.5 sm:p-4 flex flex-col overflow-visible relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <h2 id="add-unavailable-title" className="text-base font-bold text-[#121212] tracking-tight">
            Add Unavailable Schedule
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#6b7280] hover:text-[#121212] transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        <div className="w-full h-px bg-[#dedbc4] mb-2.5" />

        <div className="space-y-2.5">
          {/* Panel 1: Date */}
          <div className={panel}>
            <div className="relative" ref={datePickerRef}>
              <label className={label}>Date</label>
              <button
                type="button"
                onClick={() => {
                  setIsDatePickerOpen(!isDatePickerOpen);
                  setIsStartTimeOpen(false);
                  setIsEndTimeOpen(false);
                }}
                className={`${fieldButton} ${dateDisplay ? "text-[#121212] font-medium" : "text-[#6b7280]"}`}
              >
                <span className="truncate">{dateDisplay || "dd/mm/yyyy"}</span>
                <Calendar className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0 ml-1" />
              </button>

              {isDatePickerOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 w-64 bg-[#ffffff] border border-[#dedbc4] rounded-2xl p-3 shadow-xl select-none animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#dedbc4]/50">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={isCurrentViewMonth}
                      className={`p-1 rounded-lg text-[#121212] transition-colors ${
                        isCurrentViewMonth
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-[#fbfaf1] cursor-pointer"
                      }`}
                      title="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-[#121212]">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-[#fbfaf1] rounded-lg text-[#121212] transition-colors cursor-pointer"
                      title="Next month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#6b7280] mb-1">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {calendarDays.map((d, index) => {
                      const isSelected =
                        selectedDate &&
                        selectedDate.year === d.year &&
                        selectedDate.month === d.month &&
                        selectedDate.dayNumber === d.dayNumber;
                      const isPast = new Date(d.year, d.month, d.dayNumber) < todayStart;

                      return (
                        <button
                          key={`${d.year}-${d.month}-${d.dayNumber}-${index}`}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleSelectDay(d)}
                          className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-[11px] font-medium transition-all ${
                            isPast
                              ? "text-neutral-300 cursor-not-allowed line-through"
                              : isSelected
                              ? "bg-[#121212] text-[#ccff00] font-bold shadow-xs cursor-pointer"
                              : d.isCurrentMonth
                              ? "text-[#121212] hover:bg-[#fbfaf1] hover:font-bold cursor-pointer"
                              : "text-neutral-300 hover:text-neutral-400 cursor-pointer"
                          }`}
                        >
                          {d.dayNumber}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#dedbc4]/50 text-[11px]">
                    <button
                      type="button"
                      onClick={handleClearDate}
                      className="text-[#6b7280] hover:text-[#121212] font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleTodayDate}
                      className="text-[#121212] hover:underline font-bold cursor-pointer"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel 2: Start & End time */}
          <div className={panel}>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Start time */}
              <div className="relative" ref={startTimeRef}>
                <label className={label}>Start Time</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsStartTimeOpen(!isStartTimeOpen);
                    setIsEndTimeOpen(false);
                    setIsDatePickerOpen(false);
                  }}
                  className={`${fieldButton} ${startTime ? "text-[#121212] font-medium" : "text-[#6b7280]"}`}
                >
                  <span className="truncate">{labelFor(startTime) || "--:-- --"}</span>
                  <Clock className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0 ml-1" />
                </button>

                {isStartTimeOpen && (
                  <div className="absolute top-full mt-1 left-0 z-50 w-full max-h-44 overflow-y-auto bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                    {startSlots.map((slot) => {
                      const isSelected = startTime === slot.value;
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => {
                            setStartTime(slot.value);
                            if (endTime && endTime <= slot.value) setEndTime("");
                            setIsStartTimeOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                            isSelected
                              ? "bg-[#fbfaf1] text-[#121212] font-bold"
                              : "text-[#121212] hover:bg-neutral-50"
                          }`}
                        >
                          <span>{slot.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2] text-[#121212]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* End time */}
              <div className="relative" ref={endTimeRef}>
                <label className={label}>End Time</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsEndTimeOpen(!isEndTimeOpen);
                    setIsStartTimeOpen(false);
                    setIsDatePickerOpen(false);
                  }}
                  className={`${fieldButton} ${endTime ? "text-[#121212] font-medium" : "text-[#6b7280]"}`}
                >
                  <span className="truncate">{labelFor(endTime) || "--:-- --"}</span>
                  <Clock className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0 ml-1" />
                </button>

                {isEndTimeOpen && (
                  <div className="absolute top-full mt-1 left-0 z-50 w-full max-h-44 overflow-y-auto bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                    {endSlots.map((slot) => {
                      const isSelected = endTime === slot.value;
                      const disabled = !!startTime && slot.value <= startTime;
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setEndTime(slot.value);
                            setIsEndTimeOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                            disabled
                              ? "text-neutral-300 cursor-not-allowed"
                              : isSelected
                              ? "bg-[#fbfaf1] text-[#121212] font-bold cursor-pointer"
                              : "text-[#121212] hover:bg-neutral-50 cursor-pointer"
                          }`}
                        >
                          <span>{slot.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2] text-[#121212]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#4a4a42]">
              Courts are open {rangeLabel}. Times are limited to these hours.
            </p>
          </div>

          {/* Panel 3: Reason */}
          <div className={panel}>
            <label htmlFor="unavailable-reason" className={label}>
              Reason
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {REASON_PRESETS.map((preset) => {
                const active = selectedReason === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => pickReason(preset)}
                    aria-pressed={active}
                    className={`h-6.5 px-3 rounded-lg border text-[10.5px] font-semibold text-[#121212] transition-colors cursor-pointer ${
                      active
                        ? "bg-[#ccff00] border-[#121212] hover:bg-[#b8e600]"
                        : "bg-[#d1d5db] border-[#dedbc4] hover:bg-[#c4c8ce]"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
            <textarea
              id="unavailable-reason"
              rows={4}
              value={reason}
              onChange={handleReasonChange}
              placeholder="Add a reason..."
              className={`w-full py-1.5 px-2.5 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors focus:outline-none focus:border-[#121212] placeholder-[#6b7280] resize-none leading-relaxed ${
                reason ? "text-[#121212]" : "text-[#6b7280]"
              }`}
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="w-full h-px bg-[#dedbc4] mt-2.5 mb-2.5" />

        {/* Action */}
        <div className="w-full flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}