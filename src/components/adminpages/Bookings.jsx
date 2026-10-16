import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Calendar, ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight, RotateCcw, Check } from 'lucide-react';
import BookingsTblMenu from './BookingsTblMenu';
import BookingsViewModal from './BookingsViewModal';
import BookingsRescheduleModal from './BookingsRescheduleModal';
import BookingsCancelModal from './BookingsCancelModal';

export const INITIAL_BOOKINGS = [
  { ref: 'CR-1006', customer: 'Alyssa Cruz', date: 'Aug 27, 2026', time: '6:00 PM – 7:00 PM', pax: '4', amount: '₱ 300', status: 'Reserved' },
  { ref: 'CR-1007', customer: 'Crystal Florano', date: 'Aug 28, 2026', time: '6:00 AM – 8:00 AM', pax: '4', amount: '₱ 400', status: 'Reserved' },
  { ref: 'CR-1008', customer: 'Rovic Rosales', date: 'Aug 29, 2026', time: '10:00 AM – 12:00 PM', pax: '9', amount: '₱ 500', status: 'Reserved' },
  { ref: 'CR-1009', customer: 'Mark Deniña', date: 'Aug 29, 2026', time: '1:00 PM – 3:00 PM', pax: '7', amount: '₱ 400', status: 'Reserved' },
  { ref: 'CR-1010', customer: 'Joseph Armia', date: 'Aug 30, 2026', time: '8:00 AM – 10:00 AM', pax: '8', amount: '₱ 400', status: 'Reserved' },
  { ref: 'CR-1004', customer: 'Shan Enriquez', date: 'Aug 25, 2026', time: '4:00 PM – 6:00 PM', pax: '5', amount: '₱ 400', status: 'Cancelled' },
  { ref: 'CR-1005', customer: 'Paolo Reyes', date: 'Aug 26, 2026', time: '3:00 PM – 5:00 PM', pax: '6', amount: '₱ 400', status: 'Cancelled' },
  { ref: 'CR-1001', customer: 'David Chua', date: 'Aug 24, 2026', time: '7:00 AM – 9:00 AM', pax: '7', amount: '₱ 400', status: 'Completed' },
  { ref: 'CR-1002', customer: 'Kim Santos', date: 'Aug 24, 2026', time: '10:00 AM – 12:00 PM', pax: '8', amount: '₱ 400', status: 'Completed' },
  { ref: 'CR-1003', customer: 'Liza Fernandez', date: 'Aug 24, 2026', time: '6:00 PM – 9:00 PM', pax: '9', amount: '₱ 1,150', status: 'Completed' },
  { ref: 'CR-1011', customer: 'Brian Oconer', date: 'Aug 31, 2026', time: '8:00 AM – 10:00 AM', pax: '4', amount: '₱ 400', status: 'Reserved' },
  { ref: 'CR-1012', customer: 'Andrea Del Rosario', date: 'Aug 31, 2026', time: '1:00 PM – 3:00 PM', pax: '6', amount: '₱ 500', status: 'Reserved' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'Reserved', label: 'Reserved', color: '#ffed76', textColor: '#a5950c' },
  { id: 'Cancelled', label: 'Cancelled', color: '#ff9d90', textColor: '#c42b2b' },
  { id: 'Completed', label: 'Completed', color: '#baff95', textColor: '#4ea711' },
];

export default function Bookings() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Date filter state
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Status dropdown popover state
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Row action (kebab) menu state: which booking it belongs to + where its button is on screen
  const [openMenu, setOpenMenu] = useState(null); // { booking, rect } | null
  const pressedWhileOpenRef = useRef(false);

  // View modal state: the booking currently being viewed (null = modal closed)
  const [viewBooking, setViewBooking] = useState(null);

  // Reschedule modal state: the booking being rescheduled (null = modal closed),
  // and whether it was opened from inside the View modal (so the left button reads "Back")
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [rescheduleFromView, setRescheduleFromView] = useState(false);

  // Cancel modal state: the booking being cancelled (null = modal closed),
  // and whether it was opened from inside the View modal (so the left button reads "Back")
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelFromView, setCancelFromView] = useState(false);

  // Pagination state: 10 rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calendar popover view state (defaults to August 2026)
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(7);

  const datePickerRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date display for the filter button: dd/mm/yyyy
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return 'dd/mm/yyyy';
    const dayStr = String(selectedDate.day).padStart(2, '0');
    const monthStr = String(selectedDate.month + 1).padStart(2, '0');
    return `${dayStr}/${monthStr}/${selectedDate.year}`;
  }, [selectedDate]);

  // Calendar days generator
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        month: viewMonth === 0 ? 11 : viewMonth - 1,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        year: viewYear,
        month: viewMonth,
      });
    }

    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        dayNumber: d,
        isCurrentMonth: false,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        month: viewMonth === 11 ? 0 : viewMonth + 1,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDaySelect = (dayObj) => {
    setSelectedDate({
      year: dayObj.year,
      month: dayObj.month,
      day: dayObj.dayNumber,
    });
    setCurrentPage(1);
    setIsDatePickerOpen(false);
  };

  const handleClearDate = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    setCurrentPage(1);
    setIsDatePickerOpen(false);
  };

  const handleSelectStatus = (statusId) => {
    setStatusFilter(statusId);
    setCurrentPage(1);
    setIsStatusDropdownOpen(false);
  };

  const isFiltered = Boolean(searchQuery.trim() || statusFilter !== 'ALL' || selectedDate);
  const handleResetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSelectedDate(null);
    setCurrentPage(1);
    setIsDatePickerOpen(false);
    setIsStatusDropdownOpen(false);
  };

  // Kebab menu handlers
  const closeRowMenu = () => setOpenMenu(null);

  // Runs before the menu's own click-outside handler, so we can tell if this button was
  // pressed while its menu was already open (the menu then closes itself on mousedown).
  const handleRowMenuMouseDown = (booking) => {
    pressedWhileOpenRef.current = openMenu?.booking.ref === booking.ref;
  };

  const handleToggleRowMenu = (e, booking) => {
    if (pressedWhileOpenRef.current) {
      // Menu was open and has just been closed by the outside-click handler: keep it closed
      pressedWhileOpenRef.current = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenMenu({
      booking,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    });
  };

  // Open the view modal for the chosen booking
  const handleViewBooking = (booking) => {
    setViewBooking(booking);
  };

  const closeViewModal = () => setViewBooking(null);

  // Reschedule opened from the kebab menu: left button reads "Close"
  const handleRescheduleBooking = (booking) => {
    setRescheduleFromView(false);
    setRescheduleBooking(booking);
  };

  // Reschedule opened from inside the View modal: left button reads "Back"
  // (the View modal closes itself right before calling this)
  const handleRescheduleFromView = (booking) => {
    setRescheduleFromView(true);
    setRescheduleBooking(booking);
  };

  const closeRescheduleModal = () => {
    setRescheduleBooking(null);
    setRescheduleFromView(false);
  };

  // "Back": close the reschedule modal and return to the View modal for the same booking
  const handleBackFromReschedule = () => {
    setViewBooking(rescheduleBooking);
    setRescheduleBooking(null);
    setRescheduleFromView(false);
  };

  // Apply the new date/time to the booking in the table
  const handleConfirmReschedule = (updated) => {
    setBookings((prev) =>
      prev.map((b) => (b.ref === updated.ref ? { ...b, date: updated.date, time: updated.time } : b))
    );
  };

  // Cancel opened from the kebab menu: left button reads "Close"
  const handleCancelBooking = (booking) => {
    setCancelFromView(false);
    setCancelBooking(booking);
  };

  // Cancel opened from inside the View modal: left button reads "Back"
  // (the View modal closes itself right before calling this)
  const handleCancelFromView = (booking) => {
    setCancelFromView(true);
    setCancelBooking(booking);
  };

  const closeCancelModal = () => {
    setCancelBooking(null);
    setCancelFromView(false);
  };

  // "Back": close the cancel modal and return to the View modal for the same booking
  const handleBackFromCancel = () => {
    setViewBooking(cancelBooking);
    setCancelBooking(null);
    setCancelFromView(false);
  };

  // Set the booking's status to Cancelled in the table
  const handleConfirmCancel = (updated) => {
    setBookings((prev) =>
      prev.map((b) => (b.ref === updated.ref ? { ...b, status: 'Cancelled' } : b))
    );
  };

  // Filter Bookings logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        b.customer.toLowerCase().includes(query) ||
        b.ref.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || b.status.toUpperCase() === statusFilter.toUpperCase();

      let matchesDate = true;
      if (selectedDate) {
        const expectedDateStr = `${MONTH_SHORT[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`;
        matchesDate = b.date.toLowerCase() === expectedDateStr.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchQuery, statusFilter, selectedDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Close the row menu whenever the visible rows change (filters / page)
  useEffect(() => {
    setOpenMenu(null);
  }, [searchQuery, statusFilter, selectedDate, currentPage]);

  // The menu is placed with fixed positioning (so the table's scroll container can't clip it),
  // so close it if the page scrolls or resizes underneath it
  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [openMenu]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffed76] text-[#a5950c] select-none whitespace-nowrap">
            <span className="text-[8px] leading-none">•</span>
            <span>Reserved</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ff9d90] text-[#c42b2b] select-none whitespace-nowrap">
            <span className="text-[8px] leading-none">•</span>
            <span>Cancelled</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#baff95] text-[#4ea711] select-none whitespace-nowrap">
            <span className="text-[8px] leading-none">•</span>
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-200 text-neutral-800 select-none whitespace-nowrap">
            <span className="text-[8px] leading-none">•</span>
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="w-full flex flex-col space-y-3"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212] leading-tight">
          Bookings
        </h1>
        <p className="text-xs text-[#121212] font-normal mt-1 sm:mt-1.5 leading-relaxed">
          Manage court rental bookings — reserve, reschedule, and cancel in one place.
        </p>
      </div>

      {/* Main White Card Container */}
      <div className="w-full bg-[#ffffff] border border-[#121212] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        {/* Search bar & Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-[44%] max-w-[380px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here"
              className="w-full pl-3.5 pr-8 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs text-[#121212] placeholder-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#6b7280]">
              <Search className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>

          {/* Right Filters: Date filter, Custom Status Dropdown, and Reset Filter button */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Date filter */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-[130px] sm:w-[142px] pl-7 pr-3 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs text-[#6b7280] font-normal flex items-center justify-start text-left focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all cursor-pointer relative"
                title="Select date to filter"
              >
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#6b7280]">
                  <Calendar className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <span className="truncate">{formattedDisplayDate}</span>
              </button>

              {/* Functional Date Picker Calendar Popover Dropdown */}
              {isDatePickerOpen && (
                <div className="absolute top-full mt-1.5 right-0 sm:left-0 z-50 w-72 bg-[#ffffff] border border-[#121212] rounded-2xl p-3.5 shadow-xl select-none animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-neutral-100 rounded-lg text-[#121212] transition-colors cursor-pointer"
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
                      className="p-1 hover:bg-neutral-100 rounded-lg text-[#121212] transition-colors cursor-pointer"
                      title="Next month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#6b7280] mb-1">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {calendarDays.map((d, index) => {
                      const isSelected =
                        selectedDate &&
                        selectedDate.year === d.year &&
                        selectedDate.month === d.month &&
                        selectedDate.day === d.dayNumber;

                      return (
                        <button
                          key={`${d.year}-${d.month}-${d.dayNumber}-${index}`}
                          type="button"
                          onClick={() => handleDaySelect(d)}
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#121212] text-[#ccff00] font-bold shadow-xs'
                              : d.isCurrentMonth
                              ? 'text-[#121212] hover:bg-neutral-100 hover:font-bold'
                              : 'text-neutral-300 hover:text-neutral-500'
                          }`}
                        >
                          {d.dayNumber}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 text-[11px]">
                    <button
                      type="button"
                      onClick={handleClearDate}
                      className="text-[#6b7280] hover:text-[#121212] font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setViewYear(now.getFullYear());
                        setViewMonth(now.getMonth());
                        handleDaySelect({
                          year: now.getFullYear(),
                          month: now.getMonth(),
                          dayNumber: now.getDate(),
                        });
                      }}
                      className="text-[#121212] hover:underline font-bold cursor-pointer"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Status Filter Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-[130px] sm:w-[142px] pl-7 pr-3 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs text-[#6b7280] font-normal flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all cursor-pointer relative"
                title="Filter by status"
              >
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#6b7280]">
                  <ChevronDown className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <span className="truncate">
                  {statusFilter === 'ALL' ? 'All Statuses' : statusFilter}
                </span>
              </button>

              {/* Status Dropdown Popover */}
              {isStatusDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 z-50 w-44 bg-[#ffffff] border border-[#121212] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectStatus(opt.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-100 text-[#121212] font-bold'
                            : 'text-[#121212] hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.id !== 'ALL' ? (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: opt.color, border: `1px solid ${opt.textColor}` }}
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-neutral-300 shrink-0" />
                          )}
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-[#121212] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset Filter Button */}
            <button
              type="button"
              onClick={handleResetAllFilters}
              disabled={!isFiltered}
              className={`px-3 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 select-none ${
                isFiltered
                  ? 'text-[#121212] font-semibold hover:bg-neutral-100 cursor-pointer shadow-2xs'
                  : 'text-[#6b7280]/50 border-neutral-300 opacity-60 cursor-not-allowed'
              }`}
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#121212]">
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  REF #
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  CUSTOMER NAME
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  DATE
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  TIME
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  PAX
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  AMOUNT
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e] text-center">
                  STATUS
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e] text-center">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((b, idx) => {
                  const isMenuOpenForRow = openMenu?.booking.ref === b.ref;
                  return (
                    <tr
                      key={b.ref || idx}
                      className="border-b border-[#c4c9ac] hover:bg-neutral-50/70 transition-colors"
                    >
                      <td className="py-2 px-3 sm:px-4 text-xs font-semibold text-[#121212] whitespace-nowrap">
                        {b.ref}
                      </td>

                      <td className="py-2 px-3 sm:px-4 text-xs font-medium text-[#121212] whitespace-nowrap">
                        {b.customer}
                      </td>

                      <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#6b7280] whitespace-nowrap">
                        {b.date}
                      </td>

                      <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#6b7280] whitespace-nowrap">
                        {b.time}
                      </td>

                      <td className="py-2 px-3 sm:px-4 text-xs font-medium text-[#121212] whitespace-nowrap">
                        {b.pax}
                      </td>

                      <td className="py-2 px-3 sm:px-4 text-xs font-semibold text-[#121212] whitespace-nowrap tabular-nums">
                        {b.amount}
                      </td>

                      <td className="py-2 px-3 sm:px-4 text-center whitespace-nowrap">
                        {renderStatusBadge(b.status)}
                      </td>

                      <td className="py-2 px-3 sm:px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onMouseDown={() => handleRowMenuMouseDown(b)}
                          onClick={(e) => handleToggleRowMenu(e, b)}
                          aria-haspopup="menu"
                          aria-expanded={isMenuOpenForRow}
                          className={`inline-flex items-center justify-center w-7 h-[18px] border rounded-[4px] text-[#121212] hover:border-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer ${
                            isMenuOpenForRow
                              ? 'border-[#121212] bg-neutral-100'
                              : 'border-[#121212]/35'
                          }`}
                          title="Actions"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-xs text-[#5f5e5e]">
                    No bookings found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#5f5e5e]">
          <div>
            Showing{' '}
            <span className="font-bold text-[#121212]">
              {filteredBookings.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#121212]">
              {Math.min(currentPage * itemsPerPage, filteredBookings.length)}
            </span>{' '}
            of <span className="font-bold text-[#121212]">{filteredBookings.length}</span> court bookings
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`p-1 rounded-md border border-[#121212] transition-colors flex items-center justify-center ${
                currentPage <= 1
                  ? 'opacity-30 cursor-not-allowed bg-neutral-100 text-[#5f5e5e]'
                  : 'hover:bg-neutral-100 text-[#121212] cursor-pointer'
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[24px] h-6 px-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#121212] text-[#ccff00] border border-[#121212]'
                      : 'bg-white text-[#121212] border border-[#121212]/40 hover:border-[#121212] hover:bg-neutral-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`p-1 rounded-md border border-[#121212] transition-colors flex items-center justify-center ${
                currentPage >= totalPages
                  ? 'opacity-30 cursor-not-allowed bg-neutral-100 text-[#5f5e5e]'
                  : 'hover:bg-neutral-100 text-[#121212] cursor-pointer'
              }`}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row actions menu: one shared instance, anchored to whichever kebab button was clicked */}
      {openMenu && (
        <div
          style={{
            position: 'fixed',
            top: openMenu.rect.top,
            left: openMenu.rect.left,
            width: openMenu.rect.width,
            height: openMenu.rect.height,
            zIndex: 60,
            pointerEvents: 'none', // don't block the kebab button underneath
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <BookingsTblMenu
              isOpen
              booking={openMenu.booking}
              onClose={closeRowMenu}
              onView={handleViewBooking}
              onReschedule={handleRescheduleBooking}
              onCancel={handleCancelBooking}
            />
          </div>
        </div>
      )}

      {/* View booking modal: its Reschedule / Cancel Booking buttons open those modals in "Back" mode */}
      <BookingsViewModal
        isOpen={Boolean(viewBooking)}
        booking={viewBooking}
        onClose={closeViewModal}
        onReschedule={handleRescheduleFromView}
        onCancel={handleCancelFromView}
      />

      {/* Reschedule modal: "Close" from the kebab menu, "Back" when opened from the View modal */}
      <BookingsRescheduleModal
        isOpen={Boolean(rescheduleBooking)}
        booking={rescheduleBooking}
        fromView={rescheduleFromView}
        onClose={closeRescheduleModal}
        onBack={handleBackFromReschedule}
        onConfirmReschedule={handleConfirmReschedule}
      />

      {/* Cancel modal: "Close" from the kebab menu, "Back" when opened from the View modal */}
      <BookingsCancelModal
        isOpen={Boolean(cancelBooking)}
        booking={cancelBooking}
        fromView={cancelFromView}
        onClose={closeCancelModal}
        onBack={handleBackFromCancel}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}