import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const REASON_OPTIONS = [
  'Customer requested change of schedule',
  'Weather condition / Rain',
  'Court maintenance',
  'Player conflict / Emergency',
  'Other'
];

const TIME_SLOTS = [
  '6:00 AM',
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM'
];

/**
 * BookingsRescheduleModal
 *
 * Props:
 *  - fromView: true when this modal was opened from inside the View modal.
 *              The left button then reads "Back" and calls onBack (return to View modal).
 *              Otherwise it reads "Close" and calls onClose.
 *  - onBack:   called when "Back" is pressed.
 */
export default function BookingsRescheduleModal({
  isOpen = false,
  onClose,
  onBack,
  fromView = false,
  booking = null,
  onConfirmReschedule,
}) {
  // Form States
  const [reason, setReason] = useState('');
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  const [newDateDisplay, setNewDateDisplay] = useState('');
  const [selectedDateObj, setSelectedDateObj] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [newStartTime, setNewStartTime] = useState('');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const [notes, setNotes] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [error, setError] = useState('');

  // Calendar Navigation
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(7); // August (0-indexed)

  // Refs for click outside
  const reasonRef = useRef(null);
  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);

  // Sync state on booking load
  useEffect(() => {
    if (booking && isOpen) {
      setReason('');
      setIsReasonOpen(false);
      setNewDateDisplay('');
      setSelectedDateObj(null);
      setIsDatePickerOpen(false);
      setNewStartTime('');
      setIsTimePickerOpen(false);
      setNotes('');
      setNotifyCustomer(true);
      setShowCancellationPolicy(false);
      setError('');

      if (booking.date && booking.date.includes('2026')) {
        setViewYear(2026);
        if (booking.date.includes('Aug')) setViewMonth(7);
        else if (booking.date.includes('Sep')) setViewMonth(8);
      }
    }
  }, [booking, isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (reasonRef.current && !reasonRef.current.contains(event.target)) {
        setIsReasonOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setIsTimePickerOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: daysInPrevMonth - i,
        month: viewMonth - 1,
        year: viewYear,
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        dayNumber: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        month: viewMonth + 1,
        year: viewYear,
        isCurrentMonth: false,
      });
    }
    return days;
  }, [viewYear, viewMonth]);

  if (!isOpen || !booking) return null;

  const handlePrevMonth = (e) => {
    e.stopPropagation();
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
    setSelectedDateObj(dayObj);
    const dayStr = String(dayObj.dayNumber).padStart(2, '0');
    const monthStr = String(dayObj.month + 1).padStart(2, '0');
    setNewDateDisplay(`${dayStr}/${monthStr}/${dayObj.year}`);
    setIsDatePickerOpen(false);
    setError('');
  };

  // Safe defaults matching user prototype
  const customerName = booking.customer || booking.customerName || 'Alyssa Cruz';
  const bookingRef = booking.ref || 'CR-1006';

  // Format Date & Time display: Aug 27, 2026 • 7:00 PM · 8:00 PM
  const formattedDateTime = (() => {
    const d = booking.date || 'Aug 27, 2026';
    let t = booking.time || '7:00 PM · 8:00 PM';
    // Replace en-dash or hyphen with middle dot if matching prototype format
    t = t.replace('–', '·').replace('-', '·');
    return `${d} • ${t}`;
  })();

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!newDateDisplay) {
      setError('Please select a new date');
      return;
    }
    if (!newStartTime) {
      setError('Please select a new start time');
      return;
    }

    // Convert dd/mm/yyyy to "Aug 28, 2026"
    let formattedDateForStore = newDateDisplay;
    if (selectedDateObj) {
      const monthShort = MONTH_NAMES[selectedDateObj.month]?.slice(0, 3) || 'Aug';
      formattedDateForStore = `${monthShort} ${selectedDateObj.dayNumber}, ${selectedDateObj.year}`;
    }

    onConfirmReschedule?.({
      ...booking,
      date: formattedDateForStore,
      time: newStartTime.includes('–') ? newStartTime : `${newStartTime} – ${calculateEndTime(newStartTime)}`,
      lastUpdated: 'Today',
      rescheduleReason: reason || undefined,
      rescheduleNotes: notes || undefined,
      notifyCustomer,
    });
    onClose?.();
  };

  // Helper to calculate 1-hour slot from start time
  function calculateEndTime(startStr) {
    if (!startStr) return '';
    const [time, period] = startStr.split(' ');
    let [hour, min] = time.split(':').map(Number);
    let nextHour = hour + 1;
    let nextPeriod = period;
    if (nextHour === 12) {
      nextPeriod = period === 'AM' ? 'PM' : 'AM';
    } else if (nextHour > 12) {
      nextHour = 1;
    }
    return `${nextHour}:${String(min).padStart(2, '0')} ${nextPeriod}`;
  }

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      {/* Modal Container */}
      <div className="w-full max-w-[460px] sm:max-w-[480px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col relative transition-all duration-150">
        
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-[17px] font-bold text-[#121212] tracking-tight">
            Reschedule Booking
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 rounded-full text-[#6b7280] hover:text-[#121212] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4.5 h-4.5 stroke-[2.4]" />
          </button>
        </div>

        {/* 1st HORIZONTAL SEPARATOR */}
        <div className="mx-2.5 h-px bg-[#dedbc4] mt-2.5 mb-3 sm:mt-3 sm:mb-3.5" />

        {/* ================= UPPER SECTION ================= */}
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f5f3e5] text-[#121212] border border-[#dedbc4]/60 select-none whitespace-nowrap mb-2.5">
            Ref #: {bookingRef}
          </span>
        </div>

        {/* Two-Column Details: CUSTOMER and DATE & TIME */}
        <div className="grid grid-cols-2 gap-x-4 mb-1">
          <div>
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#525252] mb-0.5">
              CUSTOMER
            </span>
            <p className="text-xs sm:text-[13px] font-bold text-[#121212] truncate">
              {customerName}
            </p>
          </div>

          <div className="text-right">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#525252] mb-0.5">
              DATE & TIME
            </span>
            <p className="text-xs sm:text-[13px] font-bold text-[#121212] truncate">
              {formattedDateTime}
            </p>
          </div>
        </div>

        {/* ================= INNER BEIGE CONTAINER ================= */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="bg-[#fcfbf7] border border-[#dedbc4] rounded-2xl p-3 sm:p-3.5 my-2.5 sm:my-3 space-y-2.5">
            {/* Reason */}
            <div className="relative" ref={reasonRef}>
              <label className="block text-xs font-bold text-[#404040] mb-1">
                Reason
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsReasonOpen(!isReasonOpen);
                  setIsDatePickerOpen(false);
                  setIsTimePickerOpen(false);
                }}
                className={`w-full h-8 sm:h-8.5 px-3 bg-[#ffffff] border border-[#dedbc4] hover:border-[#121212] rounded-lg text-xs transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer ${
                  reason ? 'text-[#121212] font-medium' : 'text-[#9ca3af]'
                }`}
              >
                <span className="truncate">{reason || 'Select a reason'}</span>
                <ChevronDown className="w-4 h-4 text-[#6b7280] shrink-0 ml-1.5" />
              </button>

              {/* Reason dropdown menu */}
              {isReasonOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 z-60 bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-xl select-none animate-in fade-in zoom-in-95 duration-100">
                  {REASON_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setReason(opt);
                        setIsReasonOpen(false);
                        setError('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                        reason === opt
                          ? 'bg-[#121212] text-[#ccff00] font-bold'
                          : 'text-[#121212] hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {reason === opt && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Two columns: New Date & New Start Time */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* New Date */}
              <div className="relative" ref={datePickerRef}>
                <label className="block text-xs font-bold text-[#404040] mb-1">
                  New Date
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsDatePickerOpen(!isDatePickerOpen);
                    setIsReasonOpen(false);
                    setIsTimePickerOpen(false);
                  }}
                  className={`w-full h-8 sm:h-8.5 px-2.5 bg-[#ffffff] border border-[#dedbc4] hover:border-[#121212] rounded-lg text-xs transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer ${
                    newDateDisplay ? 'text-[#121212] font-medium' : 'text-[#9ca3af]'
                  }`}
                >
                  <span className="truncate">{newDateDisplay || 'dd/mm/yyyy'}</span>
                  <Calendar className="w-4 h-4 stroke-[1.8] text-[#121212] shrink-0 ml-1" />
                </button>

                {/* Calendar Popover */}
                {isDatePickerOpen && (
                  <div className="absolute top-full mt-1 left-0 z-60 w-64 bg-[#ffffff] border border-[#dedbc4] rounded-2xl p-2.5 shadow-2xl select-none animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#dedbc4]/60">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-[#fbfaf1] rounded-lg text-[#121212] transition-colors cursor-pointer"
                        title="Previous month"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
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
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-[#6b7280] mb-1">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
                      {calendarDays.map((d, index) => {
                        const isSelected =
                          selectedDateObj &&
                          selectedDateObj.year === d.year &&
                          selectedDateObj.month === d.month &&
                          selectedDateObj.dayNumber === d.dayNumber;

                        return (
                          <button
                            key={`${d.year}-${d.month}-${d.dayNumber}-${index}`}
                            type="button"
                            onClick={() => handleSelectDay(d)}
                            className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-[11px] font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#121212] text-[#ccff00] font-bold shadow-xs'
                                : d.isCurrentMonth
                                ? 'text-[#121212] hover:bg-[#fbfaf1] hover:font-bold'
                                : 'text-neutral-300 hover:text-neutral-400'
                            }`}
                          >
                            {d.dayNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* New Start Time */}
              <div className="relative" ref={timePickerRef}>
                <label className="block text-xs font-bold text-[#404040] mb-1">
                  New Start Time
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimePickerOpen(!isTimePickerOpen);
                    setIsDatePickerOpen(false);
                    setIsReasonOpen(false);
                  }}
                  className={`w-full h-8 sm:h-8.5 px-2.5 bg-[#ffffff] border border-[#dedbc4] hover:border-[#121212] rounded-lg text-xs transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer ${
                    newStartTime ? 'text-[#121212] font-medium' : 'text-[#9ca3af]'
                  }`}
                >
                  <span className="truncate">{newStartTime || '--:-- --'}</span>
                  <Clock className="w-4 h-4 stroke-[1.8] text-[#121212] shrink-0 ml-1" />
                </button>

                {/* Time Slots Popover */}
                {isTimePickerOpen && (
                  <div className="absolute top-full mt-1 right-0 z-60 w-44 max-h-48 overflow-y-auto bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-2xl select-none animate-in fade-in zoom-in-95 duration-100">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = newStartTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setNewStartTime(slot);
                            setIsTimePickerOpen(false);
                            setError('');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#121212] text-[#ccff00] font-bold'
                              : 'text-[#121212] hover:bg-neutral-100 font-medium'
                          }`}
                        >
                          <span>{slot}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#404040] mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant details here..."
                className="w-full h-15 sm:h-16 px-3 py-2 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs text-[#121212] placeholder-[#9ca3af] focus:outline-none focus:border-[#121212] transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Cancellation Policy and Notify Checkbox Row */}
          <div className="flex items-center justify-between px-0.5 my-1 text-xs">
            <button
              type="button"
              onClick={() => setShowCancellationPolicy((prev) => !prev)}
              className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline font-medium cursor-pointer"
            >
              View Cancellation Policy
            </button>

            <label className="flex items-center gap-1.5 text-xs text-[#404040] font-normal cursor-pointer select-none">
              <span>Notify customer via SMS/Email</span>
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Cancellation Policy expandable note */}
          {showCancellationPolicy && (
            <div className="mt-1.5 p-2 bg-neutral-100/90 rounded-lg text-[11px] text-[#525252] leading-tight animate-in fade-in duration-100">
              Rescheduling is permitted up to 2 hours prior to the booked slot. Rescheduled sessions must be used within 30 days of the original date.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-[11px] font-semibold text-red-600 mt-1">
              {error}
            </p>
          )}

          {/* 2nd HORIZONTAL SEPARATOR */}
          <div className="mx-2.5 h-px bg-[#dedbc4] mt-2.5 mb-3 sm:mt-3 sm:mb-3.5" />

          {/* ================= BUTTONS ROW ================= */}
          <div className="w-full flex items-center justify-between gap-2 pt-0.5">
            {/* Left button: "Back" when opened from the View modal, otherwise "Close" */}
            <button
              type="button"
              onClick={fromView ? onBack : onClose}
              className="px-6 sm:px-7 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              {fromView ? 'Back' : 'Close'}
            </button>

            {/* Confirm button */}
            <button
              type="submit"
              className="px-6 sm:px-7 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs text-center"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}