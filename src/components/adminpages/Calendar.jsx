import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Check,
  Plus
} from 'lucide-react';
import BookingsViewModal from "./BookingsViewModal";
import BookingsRescheduleModal from "./BookingsRescheduleModal";
import BookingsCancelModal from "./BookingsCancelModal";
import AddBookingModal from "./AddBookingModal";
import { INITIAL_BOOKINGS } from "./Bookings";

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// 21 Operating Hours: 6:00 AM to 2:00 AM (next morning closing boundary)
const OPERATING_HOURS = [
  { hour: 6, label: '6:00 AM' },
  { hour: 7, label: '7:00 AM' },
  { hour: 8, label: '8:00 AM' },
  { hour: 9, label: '9:00 AM' },
  { hour: 10, label: '10:00 AM' },
  { hour: 11, label: '11:00 AM' },
  { hour: 12, label: '12:00 PM' },
  { hour: 13, label: '1:00 PM' },
  { hour: 14, label: '2:00 PM' },
  { hour: 15, label: '3:00 PM' },
  { hour: 16, label: '4:00 PM' },
  { hour: 17, label: '5:00 PM' },
  { hour: 18, label: '6:00 PM' },
  { hour: 19, label: '7:00 PM' },
  { hour: 20, label: '8:00 PM' },
  { hour: 21, label: '9:00 PM' },
  { hour: 22, label: '10:00 PM' },
  { hour: 23, label: '11:00 PM' },
  { hour: 24, label: '12:00 AM' },
  { hour: 25, label: '1:00 AM' },
  { hour: 26, label: '2:00 AM' },
];

const ROW_HEIGHT = 60; // 60px per hour row for clean, legible spacing

function parseBookingDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/').map(Number);
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
}

function formatHour(h) {
  const normalized = h % 24;
  const meridian = normalized >= 12 ? 'PM' : 'AM';
  let hour12 = normalized % 12;
  if (hour12 === 0) hour12 = 12;
  const minutes = Math.round((h % 1) * 60);
  const minStr = minutes ? `:${String(minutes).padStart(2, '0')}` : ':00';
  return `${hour12}${minStr} ${meridian}`;
}

function parseBookingTime(timeStr) {
  if (!timeStr) return { startHour: 10, endHour: 12, duration: 2, formatted: '10:00 AM - 12:00 PM' };

  const parts = timeStr.split(/[–\-·]|to/).map((s) => s.trim());
  const parseSingle = (str) => {
    const match = str.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
    if (!match) return 10;
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridian = match[3].toUpperCase();

    if (meridian === 'PM' && hour < 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    // 1 AM or 2 AM early morning belongs to operating shift
    if (meridian === 'AM' && hour < 6) hour += 24;

    return hour + minute / 60;
  };

  const startHour = parseSingle(parts[0]);
  let endHour = parts[1] ? parseSingle(parts[1]) : startHour + 1;
  if (endHour <= startHour) endHour = startHour + 1;
  const duration = Math.max(0.5, endHour - startHour);

  // Always keep AM and PM cleanly formatted without truncation
  let formatted = `${formatHour(startHour)} - ${formatHour(endHour)}`;
  const match1 = parts[0]?.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
  const match2 = parts[1]?.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
  if (match1 && match2) {
    const m1 = match1[2] ? `:${match1[2]}` : ':00';
    const m2 = match2[2] ? `:${match2[2]}` : ':00';
    formatted = `${match1[1]}${m1} ${match1[3].toUpperCase()} - ${match2[1]}${m2} ${match2[3].toUpperCase()}`;
  }

  return { startHour, endHour, duration, formatted };
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Calendar Page
 * Dedicated page connected to the calendar icon in MainForm header.
 * Clean, structured weekly schedule with explicit hourly lines across all days:
 * - Clear 12-Hour AM/PM labels on the left aligned with horizontal hour lines (6:00 AM to 2:00 AM)
 * - Plotted court rental boxes with exact #CCFF00 background, bold customer name, and time | pax
 * - Interactive empty cells: Hovering shows "+ Book" button, clicking opens AddBookingModal pre-filled
 * - Top navigation bar: "< Aug 24 - Aug 30, 2026 >" + "Today" button
 * - Click on any booking to view details, reschedule, or cancel via modals
 */
export default function CalendarPage({ bookings: propBookings }) {
  const [internalBookings, setInternalBookings] = useState(propBookings || INITIAL_BOOKINGS);

  useEffect(() => {
    if (propBookings) {
      setInternalBookings(propBookings);
    }
  }, [propBookings]);

  const bookings = internalBookings;

  // Calendar week state
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(() => new Date(2026, 7, 27));

  // Modals state
  const [viewingBooking, setViewingBooking] = useState(null);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [addBookingInitialData, setAddBookingInitialData] = useState(null);
  const [notification, setNotification] = useState(null);

  // Calculate Monday to Sunday dates
  const weekDays = useMemo(() => {
    const anchor = new Date(currentWeekAnchor);
    const day = anchor.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentWeekAnchor]);

  const weekRangeLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    const firstMonth = SHORT_MONTH_NAMES[first.getMonth()];
    const lastMonth = SHORT_MONTH_NAMES[last.getMonth()];

    if (firstMonth === lastMonth) {
      return `${firstMonth} ${first.getDate()} - ${lastMonth} ${last.getDate()}, ${first.getFullYear()}`;
    }
    return `${firstMonth} ${first.getDate()} - ${lastMonth} ${last.getDate()}, ${last.getFullYear()}`;
  }, [weekDays]);

  const handlePrevWeek = () => {
    setCurrentWeekAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  // Group bookings by day index (0 to 6)
  const bookingsByDay = useMemo(() => {
    const map = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    bookings.forEach((b) => {
      const bDate = parseBookingDate(b.date);
      if (!bDate) return;
      const dayIdx = weekDays.findIndex((wd) => isSameDay(wd, bDate));
      if (dayIdx !== -1) {
        const timeInfo = parseBookingTime(b.time);
        map[dayIdx].push({ ...b, ...timeInfo, parsedDate: bDate });
      }
    });

    return map;
  }, [bookings, weekDays]);

  // Handle clicking on an empty hour slot to add a booking
  const handleEmptySlotClick = (dayDate, timeLabel) => {
    const dayStr = String(dayDate.getDate()).padStart(2, '0');
    const monthStr = String(dayDate.getMonth() + 1).padStart(2, '0');
    setAddBookingInitialData({
      date: `${dayStr}/${monthStr}/${dayDate.getFullYear()}`,
      startTime: timeLabel,
    });
    setIsAddBookingOpen(true);
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="w-full flex flex-col space-y-3.5 select-none"
    >
      {/* ================= TOP NAVIGATION BAR ================= */}
      <div className="w-full bg-[#ffffff] border border-[#121212] rounded-2xl px-4 py-3 sm:px-5 flex items-center justify-between shadow-2xs">
        {/* Week Navigation < Aug 24 - Aug 30, 2026 > */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="p-1 hover:bg-neutral-100 rounded-lg text-[#121212] transition-colors cursor-pointer"
            title="Previous week"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <span className="text-base sm:text-[17px] font-bold text-[#121212] tracking-tight">
            {weekRangeLabel}
          </span>

          <button
            type="button"
            onClick={handleNextWeek}
            className="p-1 hover:bg-neutral-100 rounded-lg text-[#121212] transition-colors cursor-pointer"
            title="Next week"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* ================= MAIN CALENDAR GRID WITH EXPLICIT HOURLY LINES ================= */}
      <div className="w-full bg-[#ffffff] border border-[#121212] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            {/* Header Row: Empty top-left cell + 7 Day Columns */}
            <div className="grid grid-cols-[88px_repeat(7,1fr)] border-b border-[#121212] bg-[#ffffff] sticky top-0 z-20">
              {/* Corner Empty cell */}
              <div className="border-r border-[#121212] py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#717171] bg-neutral-50/50 flex items-center justify-center">
                Time
              </div>

              {/* 7 Days: "<day> - <DayName>" e.g. "24 - Mon", "25 - Tue" */}
              {weekDays.map((d, idx) => {
                const dayNumber = d.getDate();
                const dayLabel = DAY_LABELS[idx];
                const isToday = isSameDay(d, new Date(2026, 7, 27));

                return (
                  <div
                    key={idx}
                    className={`py-3 text-center border-r border-[#121212] last:border-r-0 transition-colors ${
                      isToday ? 'bg-[#fcfbf7]' : ''
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#121212] tracking-tight">
                      {dayNumber} - {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Grid: 21 Hourly Rows with Dividing Lines */}
            <div className="divide-y divide-[#dedbc4]">
              {OPERATING_HOURS.map((slot) => (
                <div
                  key={slot.hour}
                  style={{ height: `${ROW_HEIGHT}px` }}
                  className="grid grid-cols-[88px_repeat(7,1fr)]"
                >
                  {/* Time Label on the left */}
                  <div className="border-r border-[#121212] px-2.5 flex items-center justify-end text-xs font-semibold text-[#525252] bg-neutral-50/40 select-none">
                    {slot.label}
                  </div>

                  {/* 7 Day Cells */}
                  {weekDays.map((d, dayIdx) => {
                    const dayBookings = bookingsByDay[dayIdx] || [];
                    // Does a booking start at this hour?
                    const startingBooking = dayBookings.find(
                      (b) => Math.floor(b.startHour) === slot.hour
                    );
                    // Is this hour slot covered by an existing booking?
                    const isCovered = dayBookings.some(
                      (b) => b.startHour <= slot.hour && b.endHour > slot.hour
                    );

                    return (
                      <div
                        key={dayIdx}
                        className="border-r border-[#121212] last:border-r-0 relative group transition-colors"
                      >
                        {/* Starting Booking Card (spans duration * ROW_HEIGHT) */}
                        {startingBooking && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingBooking(startingBooking);
                            }}
                            style={{
                              height: `${startingBooking.duration * ROW_HEIGHT - 6}px`,
                              top: '3px',
                              left: '3px',
                              right: '3px',
                            }}
                            className="absolute rounded-xl border border-[#121212] bg-[#CCFF00] text-[#121212] px-2.5 py-1.5 flex flex-col justify-start gap-1 transition-all cursor-pointer hover:scale-[1.01] hover:shadow-md z-10 select-none overflow-hidden"
                            title={`${startingBooking.customer} (${startingBooking.formatted}) • ${startingBooking.pax} pax`}
                          >
                            {/* Row 1: Customer Name in Bold + Pax Badge */}
                            <div className="flex items-center justify-between gap-1 leading-tight min-w-0">
                              <span className="font-bold text-xs sm:text-[13px] text-[#121212] truncate">
                                {startingBooking.customer}
                              </span>
                              <span className="text-[10px] font-bold text-[#121212]/80 bg-[#121212]/10 px-1.5 py-0.5 rounded leading-none shrink-0">
                                {startingBooking.pax} pax
                              </span>
                            </div>

                            {/* Row 2: Full Time details always showing complete AM and PM without any ellipsis */}
                            <div className="text-[11px] sm:text-xs font-semibold text-[#121212] tracking-tight leading-none whitespace-nowrap">
                              {startingBooking.formatted}
                            </div>
                          </div>
                        )}

                        {/* Empty Slot: hover & click to Add Booking */}
                        {!isCovered && (
                          <div
                            onClick={() => handleEmptySlotClick(d, slot.label)}
                            className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-[#fcfbf7] transition-colors"
                          >
                            <span className="hidden group-hover:inline-flex items-center gap-1 text-[10px] font-bold text-[#121212] bg-[#f5f3e5] hover:bg-[#ebf8b8] px-2.5 py-0.5 rounded-full border border-[#dedbc4] shadow-xs active:scale-95 transition-all">
                              <Plus className="w-3 h-3 stroke-[2.2]" /> Book
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Information note about Court Operating Hours */}
      <div className="flex items-center justify-between text-xs text-[#525252] px-1 pt-0.5">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#121212] shrink-0" />
          <span>
            Operating Hours: <strong>6:00 AM – 2:00 AM</strong>. Click any booking to view details, reschedule, or cancel. Click empty slots to add a booking.
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-28 right-6 z-60 bg-[#121212] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#333] animate-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 text-[#ccff00] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddBookingOpen}
        onClose={() => {
          setIsAddBookingOpen(false);
          setAddBookingInitialData(null);
        }}
        initialData={addBookingInitialData}
        onBookingAdded={(newBooking) => {
          const nextRefNum = 1013 + bookings.length - INITIAL_BOOKINGS.length;
          const newRef = `CR-${nextRefNum}`;
          const created = {
            ref: newRef,
            customer: newBooking.customerName || 'Anonymous Guest',
            date: newBooking.date || 'Aug 27, 2026',
            time: newBooking.startTime ? `${newBooking.startTime} (${newBooking.duration || 1} hr)` : '6:00 PM – 7:00 PM',
            pax: String(newBooking.players || 4),
            amount: `₱ ${newBooking.totalAmount || 300}`,
            status: 'Reserved',
          };
          setInternalBookings((prev) => [created, ...prev]);
          setIsAddBookingOpen(false);
          setAddBookingInitialData(null);
          setNotification(`Booking ${newRef} reserved for ${created.customer}!`);
          setTimeout(() => setNotification(null), 3500);
        }}
      />

      {/* Bookings View Modal */}
      <BookingsViewModal
        isOpen={Boolean(viewingBooking)}
        onClose={() => setViewingBooking(null)}
        booking={viewingBooking}
        onReschedule={(b) => {
          setViewingBooking(null);
          setReschedulingBooking(b);
        }}
        onCancel={(b) => {
          setViewingBooking(null);
          setCancellingBooking(b);
        }}
      />

      {/* Bookings Reschedule Modal */}
      <BookingsRescheduleModal
        isOpen={Boolean(reschedulingBooking)}
        onClose={() => setReschedulingBooking(null)}
        booking={reschedulingBooking}
        onConfirmReschedule={(updated) => {
          setInternalBookings((prev) =>
            prev.map((item) => (item.ref === updated.ref ? { ...item, ...updated } : item))
          );
          setReschedulingBooking(null);
          setNotification(`Booking ${updated.ref} rescheduled to ${updated.date} (${updated.time})!`);
          setTimeout(() => setNotification(null), 3500);
        }}
      />

      {/* Bookings Cancel Modal */}
      <BookingsCancelModal
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        booking={cancellingBooking}
        onConfirmCancel={(cancelled) => {
          setInternalBookings((prev) =>
            prev.map((item) => (item.ref === cancelled.ref ? { ...item, ...cancelled, status: 'Cancelled' } : item))
          );
          setCancellingBooking(null);
          setNotification(`Booking ${cancelled.ref} cancelled!`);
          setTimeout(() => setNotification(null), 3500);
        }}
      />
    </div>
  );
}
