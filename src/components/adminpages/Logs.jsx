import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
} from 'lucide-react';

const INITIAL_LOGS = [
  {
    id: 'LOG-2001',
    date: 'Aug 27, 2026',
    time: '6:14 PM',
    category: 'Booking',
    activity: 'Created reservation CR-1006',
    performedBy: 'Alyssa Cruz',
    action: 'Created reservation CR-1006',
    user: 'Alyssa Cruz',
  },
  {
    id: 'LOG-2002',
    date: 'Aug 27, 2026',
    time: '6:16 PM',
    category: 'Payment',
    activity: 'Confirmed payment for CR-1006',
    performedBy: 'Crystal Florano',
    action: 'Confirmed payment for CR-1006',
    user: 'Crystal Florano',
  },
  {
    id: 'LOG-2003',
    date: 'Aug 28, 2026',
    time: '8:30 AM',
    category: 'Booking',
    activity: 'Created reservation CR-1007',
    performedBy: 'Alyssa Cruz',
    action: 'Created reservation CR-1007',
    user: 'Alyssa Cruz',
  },
  {
    id: 'LOG-2004',
    date: 'Aug 28, 2026',
    time: '8:32 AM',
    category: 'Payment',
    activity: 'Received payment for CR-1007',
    performedBy: 'Joseph Armia',
    action: 'Received payment for CR-1007',
    user: 'Joseph Armia',
  },
  {
    id: 'LOG-2005',
    date: 'Aug 28, 2026',
    time: '11:20 AM',
    category: 'Account',
    activity: 'Updated staff profile details',
    performedBy: 'Rovic Rosales',
    action: 'Updated staff profile details',
    user: 'Rovic Rosales',
  },
  {
    id: 'LOG-2006',
    date: 'Aug 29, 2026',
    time: '1:15 PM',
    category: 'Settings',
    activity: 'Updated court pricing policy',
    performedBy: 'Crystal Florano',
    action: 'Updated court pricing policy',
    user: 'Crystal Florano',
  },
  {
    id: 'LOG-2007',
    date: 'Aug 29, 2026',
    time: '2:40 PM',
    category: 'Booking',
    activity: 'Created reservation CR-1008',
    performedBy: 'Alyssa Cruz',
    action: 'Created reservation CR-1008',
    user: 'Alyssa Cruz',
  },
  {
    id: 'LOG-2008',
    date: 'Aug 29, 2026',
    time: '3:05 PM',
    category: 'Booking',
    activity: 'Cancelled reservation CR-1004',
    performedBy: 'Mark Deniña',
    action: 'Cancelled reservation CR-1004',
    user: 'Mark Deniña',
  },
  {
    id: 'LOG-2009',
    date: 'Aug 29, 2026',
    time: '3:10 PM',
    category: 'Payment',
    activity: 'Processed refund for CR-1004',
    performedBy: 'Crystal Florano',
    action: 'Processed refund for CR-1004',
    user: 'Crystal Florano',
  },
  {
    id: 'LOG-2010',
    date: 'Aug 30, 2026',
    time: '9:00 AM',
    category: 'Account',
    activity: 'Added new staff account',
    performedBy: 'David Chua',
    action: 'Added new staff account',
    user: 'David Chua',
  },
  {
    id: 'LOG-2011',
    date: 'Aug 30, 2026',
    time: '11:59 PM',
    category: 'Settings',
    activity: 'Automated database backup',
    performedBy: 'System',
    action: 'Automated database backup',
    user: 'System',
  },
  {
    id: 'LOG-2012',
    date: 'Aug 31, 2026',
    time: '7:45 AM',
    category: 'Payment',
    activity: 'Verified online Maya transfer',
    performedBy: 'Kim Santos',
    action: 'Verified online Maya transfer',
    user: 'Kim Santos',
  },
  {
    id: 'LOG-2013',
    date: 'Aug 31, 2026',
    time: '4:30 PM',
    category: 'Settings',
    activity: 'Updated operating schedule',
    performedBy: 'Crystal Florano',
    action: 'Updated operating schedule',
    user: 'Crystal Florano',
  },
  {
    id: 'LOG-2014',
    date: 'Aug 31, 2026',
    time: '5:00 PM',
    category: 'Booking',
    activity: 'Completed reservation CR-1001',
    performedBy: 'Alyssa Cruz',
    action: 'Completed reservation CR-1001',
    user: 'Alyssa Cruz',
  },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CATEGORY_OPTIONS = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'Booking', label: 'Booking', bg: '#fce7f3', color: '#ec4899' },
  { id: 'Payment', label: 'Payment', bg: '#e0f2fe', color: '#0ea5e9' },
  { id: 'Account', label: 'Account', bg: '#f3e8ff', color: '#a855f7' },
  { id: 'Settings', label: 'Settings', bg: '#f1f5f9', color: '#64748b' },
];

export default function Logs() {
  const [logs] = useState(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Date filter state
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(7); // August (0-indexed: 7)

  // Category dropdown state
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Pagination state: 10 rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Refs for closing popovers on outside clicks
  const datePickerRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calendar days computation for Date Picker
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

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

    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        dayNumber: i,
        month: viewMonth + 1,
        year: viewYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (dayObj) => {
    let year = dayObj.year;
    let month = dayObj.month;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }

    setSelectedDate({
      year,
      month,
      day: dayObj.dayNumber,
    });
    setIsDatePickerOpen(false);
    setCurrentPage(1);
  };

  const handleClearDate = () => {
    setSelectedDate(null);
    setIsDatePickerOpen(false);
    setCurrentPage(1);
  };

  const formattedDisplayDate = selectedDate
    ? `${String(selectedDate.day).padStart(2, '0')}/${String(selectedDate.month + 1).padStart(2, '0')}/${selectedDate.year}`
    : 'dd/mm/yyyy';

  // Filtered logs computation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search matching across multiple fields
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          log.id.toLowerCase().includes(query) ||
          (log.performedBy || log.user || '').toLowerCase().includes(query) ||
          (log.activity || log.action || '').toLowerCase().includes(query) ||
          log.category.toLowerCase().includes(query) ||
          log.date.toLowerCase().includes(query) ||
          log.time.toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      // Category filter matching
      if (categoryFilter !== 'ALL') {
        if (log.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      // Date filter matching
      if (selectedDate) {
        const targetDateStr = `${MONTH_SHORT[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`;
        if (log.date !== targetDateStr) {
          return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, categoryFilter, selectedDate]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Paginated rows
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const isFiltered = searchQuery !== '' || categoryFilter !== 'ALL' || selectedDate !== null;

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setSelectedDate(null);
    setCurrentPage(1);
    setIsCategoryDropdownOpen(false);
    setIsDatePickerOpen(false);
  };

  const handleSelectCategory = (id) => {
    setCategoryFilter(id);
    setIsCategoryDropdownOpen(false);
    setCurrentPage(1);
  };

  // Category Badge Renderer with user specified colors:
  // Booking (bg: #fce7f3, text color: #ec4899)
  // Payment (bg:#e0f2fe, text color: #0ea5e9)
  // Account (bg: #f3e8ff, text color: #a855f7)
  // Settings (bg: #f1f5f9, text color: #64748b)
  const renderCategoryBadge = (category) => {
    switch (category) {
      case 'Booking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fce7f3] text-[#ec4899] select-none whitespace-nowrap shadow-2xs">
            <span className="text-[8px] leading-none">•</span>
            <span>Booking</span>
          </span>
        );
      case 'Payment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e0f2fe] text-[#0ea5e9] select-none whitespace-nowrap shadow-2xs">
            <span className="text-[8px] leading-none">•</span>
            <span>Payment</span>
          </span>
        );
      case 'Account':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f3e8ff] text-[#a855f7] select-none whitespace-nowrap shadow-2xs">
            <span className="text-[8px] leading-none">•</span>
            <span>Account</span>
          </span>
        );
      case 'Settings':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f1f5f9] text-[#64748b] select-none whitespace-nowrap shadow-2xs">
            <span className="text-[8px] leading-none">•</span>
            <span>Settings</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-200 text-neutral-800 select-none whitespace-nowrap">
            <span className="text-[8px] leading-none">•</span>
            <span>{category}</span>
          </span>
        );
    }
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="w-full flex flex-col space-y-3"
    >
      {/* Page Header: Title and Subtext matching Bookings.jsx */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212] leading-tight">
          Logs
        </h1>
        <p className="text-xs text-[#121212] font-normal mt-1 sm:mt-1.5 leading-relaxed">
          Track system activities, audit trails, and security events — all in one place.
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

          {/* Right Filters: Date filter, Category filter, and Reset button */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Date filter dropdown */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => {
                  setIsDatePickerOpen(!isDatePickerOpen);
                  setIsCategoryDropdownOpen(false);
                }}
                className={`w-[130px] sm:w-[142px] pl-7 pr-3 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs font-normal flex items-center justify-start text-left focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all cursor-pointer relative ${
                  selectedDate ? 'text-[#121212] font-medium' : 'text-[#6b7280]'
                }`}
                title="Select date to filter"
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none transition-colors ${
                    selectedDate ? 'text-[#121212]' : 'text-[#6b7280]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <span className="truncate">{formattedDisplayDate}</span>
              </button>

              {/* Functional Date Picker Calendar Popover */}
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

            {/* Custom Category Filter Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  setIsDatePickerOpen(false);
                }}
                className={`w-[130px] sm:w-[145px] pl-7 pr-3 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs font-normal flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all cursor-pointer relative ${
                  categoryFilter !== 'ALL' ? 'text-[#121212] font-medium' : 'text-[#6b7280]'
                }`}
                title="Filter by category"
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none transition-colors ${
                    categoryFilter !== 'ALL' ? 'text-[#121212]' : 'text-[#6b7280]'
                  }`}
                >
                  <ChevronDown className="w-3.5 h-3.5 stroke-[1.8]" />
                </div>
                <span className="truncate">
                  {categoryFilter === 'ALL' ? 'All Categories' : categoryFilter}
                </span>
              </button>

              {/* Category Dropdown Popover */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 z-50 w-44 bg-[#ffffff] border border-[#121212] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const isSelected = categoryFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectCategory(opt.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-100 text-[#121212] font-bold'
                            : 'text-[#121212] hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.id !== 'ALL' ? (
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: opt.bg, border: `1px solid ${opt.color}` }}
                            />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 shrink-0" />
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

        {/* Logs Table: Matches Bookings.jsx style & typography */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-[#121212]">
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  LOG ID
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  DATE
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  TIME
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e] text-center">
                  CATEGORY
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  ACTIVITY
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  PERFORMED BY
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, idx) => (
                  <tr
                    key={log.id || idx}
                    className="border-b border-[#c4c9ac] hover:bg-neutral-50/70 transition-colors"
                  >
                    <td className="py-2 px-3 sm:px-4 text-xs font-semibold text-[#121212] whitespace-nowrap">
                      {log.id}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#121212] whitespace-nowrap">
                      {log.date}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#6b7280] whitespace-nowrap">
                      {log.time}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-center whitespace-nowrap">
                      {renderCategoryBadge(log.category)}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#121212]">
                      {log.activity || log.action}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-medium text-[#121212] whitespace-nowrap">
                      {log.performedBy || log.user}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-[#5f5e5e]">
                    No logs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar: Matches Bookings.jsx style & typography */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#5f5e5e]">
          <div>
            Showing{' '}
            <span className="font-bold text-[#121212]">
              {filteredLogs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#121212]">
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
            </span>{' '}
            of <span className="font-bold text-[#121212]">{filteredLogs.length}</span> activity logs
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`p-1 rounded-md border border-[#121212] transition-colors cursor-pointer ${
                currentPage <= 1
                  ? 'opacity-30 cursor-not-allowed text-neutral-400 border-neutral-300'
                  : 'hover:bg-neutral-100 text-[#121212]'
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[28px] h-7 px-1 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#121212] text-[#ccff00] font-bold shadow-2xs'
                      : 'border border-[#121212]/30 text-[#121212] hover:bg-neutral-100'
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
              className={`p-1 rounded-md border border-[#121212] transition-colors cursor-pointer ${
                currentPage >= totalPages
                  ? 'opacity-30 cursor-not-allowed text-neutral-400 border-neutral-300'
                  : 'hover:bg-neutral-100 text-[#121212]'
              }`}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
