import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
];

const BOOKING_SOURCES = [
  'Walk-in',
  'Online / App',
  'Phone',
  'Social Media'
];

const PAYMENT_METHODS = [
  'Cash',
  'GCash',
  'Maya',
  'Bank Transfer'
];

export default function AddBookingModal({ isOpen = true, onClose, onBookingAdded }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Session Details State
  const [selectedDate, setSelectedDate] = useState(null); // { year, month, dayNumber }
  const [dateDisplay, setDateDisplay] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(7); // August (0-indexed)

  const [startTime, setStartTime] = useState('');
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);

  const [duration, setDuration] = useState(0);
  const [players, setPlayers] = useState(0);

  // Step 2: Add-Ons State
  const [paddleRental, setPaddleRental] = useState(0);
  const [ballRental, setBallRental] = useState(0);

  // Step 3: Customer & Payment State
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  const [bookingSource, setBookingSource] = useState('');
  const [isBookingSourceOpen, setIsBookingSourceOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);

  const [notes, setNotes] = useState('');

  // Refs for click-outside
  const datePickerRef = useRef(null);
  const startTimeRef = useRef(null);
  const bookingSourceRef = useRef(null);
  const paymentMethodRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
      if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
        setIsStartTimeOpen(false);
      }
      if (bookingSourceRef.current && !bookingSourceRef.current.contains(event.target)) {
        setIsBookingSourceOpen(false);
      }
      if (paymentMethodRef.current && !paymentMethodRef.current.contains(event.target)) {
        setIsPaymentMethodOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar days calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];
    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: daysInPrevMonth - i,
        month: viewMonth - 1,
        year: viewYear,
        isCurrentMonth: false,
      });
    }
    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        dayNumber: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }
    // Next month filler days to complete grid (42 cells)
    const remaining = 42 - days.length;
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
    setSelectedDate(dayObj);
    const dayStr = String(dayObj.dayNumber).padStart(2, '0');
    const monthStr = String(dayObj.month + 1).padStart(2, '0');
    setDateDisplay(`${dayStr}/${monthStr}/${dayObj.year}`);
    setIsDatePickerOpen(false);
  };

  const handleClearDate = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    setDateDisplay('');
    setIsDatePickerOpen(false);
  };

  const handleTodayDate = (e) => {
    e.stopPropagation();
    const now = new Date();
    const dayObj = {
      dayNumber: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
      isCurrentMonth: true,
    };
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    handleSelectDay(dayObj);
  };

  // Cost calculations
  const additionalPlayers = Math.max(0, players > 4 ? players - 4 : 0);
  const additionalPlayersCost = additionalPlayers * 100;
  const courtRate = duration * 200;
  const paddleRentalCost = paddleRental * 100;
  const ballRentalCost = ballRental * 50;
  const totalAmount = courtRate + additionalPlayersCost + paddleRentalCost + ballRentalCost;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleConfirm = () => {
    if (onBookingAdded) {
      onBookingAdded({
        date: dateDisplay,
        startTime,
        duration,
        players,
        paddleRental,
        ballRental,
        customerName,
        contactNumber,
        emailAddress,
        bookingSource,
        paymentMethod,
        notes,
        totalAmount,
      });
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none"
    >
      {/* Modal Container: Compact, comfortable padding, side-by-side on Step 3, fits screen without scroll or fullscreen */}
      <div className={`w-full ${currentStep === 3 ? 'max-w-[760px] sm:max-w-[780px]' : 'max-w-[500px] sm:max-w-[520px]'} bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-2xl p-3.5 sm:p-4 flex flex-col overflow-visible transition-all duration-200 relative`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-base font-bold text-[#121212] tracking-tight">
            Add Court Rental
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#6b7280] hover:text-[#121212] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Horizontal separator after the header line color: #dedbc4 */}
        <div className="w-full h-px bg-[#dedbc4] mb-2.5" />

        {/* Stepper (3 Steps): Line separators centered vertically with circles and elongated */}
        <div className="w-full mb-2.5 px-2 sm:px-3">
          {/* Circles and Connecting Lines Row */}
          <div className="flex items-center w-full">
            {/* Step 1 Circle */}
            <div
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors shadow-xs ${
                currentStep === 1
                  ? 'bg-[#121212] text-[#ccff00]'
                  : currentStep > 1
                  ? 'bg-[#ccff00] text-[#121212]'
                  : 'bg-[#d1d5db] text-[#4a4a42]'
              }`}
            >
              {currentStep > 1 ? (
                <Check className="w-3 h-3 stroke-[2.5]" />
              ) : (
                1
              )}
            </div>

            {/* Line separator 1-2 (elongated, perfectly centered vertically in the middle of circles) */}
            <div className="flex-1 flex items-center px-2">
              <div
                className={`w-full h-[2px] transition-colors ${
                  currentStep > 1 ? 'bg-[#ccff00]' : 'bg-[#dedbc4]'
                }`}
              />
            </div>

            {/* Step 2 Circle */}
            <div
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors shadow-xs ${
                currentStep === 2
                  ? 'bg-[#121212] text-[#ccff00]'
                  : currentStep > 2
                  ? 'bg-[#ccff00] text-[#121212]'
                  : 'bg-[#d1d5db] text-[#4a4a42]'
              }`}
            >
              {currentStep > 2 ? (
                <Check className="w-3 h-3 stroke-[2.5]" />
              ) : (
                2
              )}
            </div>

            {/* Line separator 2-3 (elongated, perfectly centered vertically in the middle of circles) */}
            <div className="flex-1 flex items-center px-2">
              <div
                className={`w-full h-[2px] transition-colors ${
                  currentStep > 2 ? 'bg-[#ccff00]' : 'bg-[#dedbc4]'
                }`}
              />
            </div>

            {/* Step 3 Circle */}
            <div
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors shadow-xs ${
                currentStep === 3
                  ? 'bg-[#121212] text-[#ccff00]'
                  : currentStep > 3
                  ? 'bg-[#ccff00] text-[#121212]'
                  : 'bg-[#d1d5db] text-[#4a4a42]'
              }`}
            >
              {currentStep > 3 ? (
                <Check className="w-3 h-3 stroke-[2.5]" />
              ) : (
                3
              )}
            </div>
          </div>

          {/* Labels Row below circles: aligned cleanly under respective step indicators */}
          <div className="relative h-3.5 mt-1.5 text-[10px] font-bold tracking-tight">
            {/* Step 1 Label */}
            <span
              className={`absolute left-0 transition-colors ${
                currentStep >= 1 ? 'text-[#121212]' : 'text-[#4a4a42]'
              }`}
            >
              SESSION DETAILS
            </span>

            {/* Step 2 Label */}
            <span
              className={`absolute left-1/2 -translate-x-1/2 transition-colors ${
                currentStep >= 2 ? 'text-[#121212]' : 'text-[#4a4a42]'
              }`}
            >
              ADD-ONS
            </span>

            {/* Step 3 Label */}
            <span
              className={`absolute right-0 transition-colors ${
                currentStep === 3 ? 'text-[#121212]' : 'text-[#4a4a42]'
              }`}
            >
              CUSTOMER & PAYMENT
            </span>
          </div>
        </div>

        {/* STEP 1: SESSION DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-2.5">
            {/* Panel 1: Date & Start Time */}
            <div className="bg-[#fbfaf1] border border-[#dedbc4] rounded-xl p-2.5 sm:p-3">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Date with Custom Date Picker Popover */}
                <div className="relative" ref={datePickerRef}>
                  <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                    Date
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDatePickerOpen(!isDatePickerOpen);
                      setIsStartTimeOpen(false);
                    }}
                    className={`w-full h-7.5 sm:h-8 pl-3 pr-2.5 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer ${
                      dateDisplay ? 'text-[#121212] font-medium' : 'text-[#6b7280]'
                    }`}
                  >
                    <span className="truncate">{dateDisplay || 'dd/mm/yyyy'}</span>
                    <Calendar className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0 ml-1" />
                  </button>

                  {/* Calendar Popover */}
                  {isDatePickerOpen && (
                    <div className="absolute top-full mt-1 left-0 z-50 w-64 bg-[#ffffff] border border-[#dedbc4] rounded-2xl p-3 shadow-xl select-none animate-in fade-in duration-100">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#dedbc4]/50">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 hover:bg-[#fbfaf1] rounded-lg text-[#121212] transition-colors cursor-pointer"
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
                            selectedDate.dayNumber === d.dayNumber;

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

                {/* Start Time Dropdown */}
                <div className="relative" ref={startTimeRef}>
                  <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                    Start Time
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStartTimeOpen(!isStartTimeOpen);
                      setIsDatePickerOpen(false);
                    }}
                    className={`w-full h-7.5 sm:h-8 pl-3 pr-2.5 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer ${
                      startTime ? 'text-[#121212] font-medium' : 'text-[#6b7280]'
                    }`}
                  >
                    <span className="truncate">{startTime || '--:-- --'}</span>
                    <Clock className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0 ml-1" />
                  </button>

                  {/* Start Time Popover Menu */}
                  {isStartTimeOpen && (
                    <div className="absolute top-full mt-1 left-0 z-50 w-full max-h-44 overflow-y-auto bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = startTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setStartTime(slot);
                              setIsStartTimeOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                              isSelected
                                ? 'bg-[#fbfaf1] text-[#121212] font-bold'
                                : 'text-[#121212] hover:bg-neutral-50'
                            }`}
                          >
                            <span>{slot}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2] text-[#121212]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel 2: Duration (hrs) & Players */}
            <div className="bg-[#fbfaf1] border border-[#dedbc4] rounded-xl p-2.5 sm:p-3">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Duration (hrs) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                    Duration (hrs)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDuration((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#dedbc4] text-[#121212] font-semibold text-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      –
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#121212]">
                      {duration}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDuration((prev) => prev + 1)}
                      className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#dedbc4] text-[#121212] font-semibold text-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Players */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                    Players
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlayers((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#dedbc4] text-[#121212] font-semibold text-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      –
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#121212]">
                      {players}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPlayers((prev) => prev + 1)}
                      className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#dedbc4] text-[#121212] font-semibold text-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ADD-ONS */}
        {currentStep === 2 && (
          <div className="space-y-2.5">
            <div className="bg-[#fbfaf1] border border-[#dedbc4] rounded-xl p-2.5 sm:p-3">
              <h3 className="text-[10px] sm:text-[10.5px] font-bold text-[#121212] mb-2.5 uppercase tracking-wide">
                Equipment Rental
              </h3>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Paddle Rental */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                    Paddle Rental
                  </label>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => setPaddleRental((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#dedbc4] text-[#121212] font-semibold text-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      –
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#121212]">
                      {paddleRental}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPaddleRental((prev) => prev + 1)}
                      className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#dedbc4] text-[#121212] font-semibold text-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[11px] text-[#4a4a42]">
                    ₱ 100/session
                  </div>
                </div>

                {/* Ball Rental */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                    Ball Rental
                  </label>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => setBallRental((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#dedbc4] text-[#121212] font-semibold text-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      –
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#121212]">
                      {ballRental}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBallRental((prev) => prev + 1)}
                      className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#dedbc4] text-[#121212] font-semibold text-xs flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[11px] text-[#4a4a42]">
                    ₱ 50/session
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CUSTOMER & PAYMENT (Side-by-side with Dedicated Booking Summary) */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            {/* Left Column (7 cols): Customer Details & Payment Source Forms */}
            <div className="md:col-span-7 space-y-2 flex flex-col justify-between">
              {/* Customer Details Form Panel */}
              <div className="bg-[#fbfaf1] border border-[#dedbc4] rounded-xl p-2.5 sm:p-3">
                <h3 className="text-[10px] sm:text-[10.5px] font-bold text-[#121212] uppercase tracking-wider mb-2">
                  CUSTOMER DETAILS
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className={`w-full h-7.5 sm:h-8 px-2.5 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors focus:outline-none focus:border-[#121212] placeholder-[#6b7280] ${
                        customerName ? 'text-[#121212]' : 'text-[#6b7280]'
                      }`}
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Enter 11-digit number"
                      className={`w-full h-7.5 sm:h-8 px-2.5 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors focus:outline-none focus:border-[#121212] placeholder-[#6b7280] ${
                        contactNumber ? 'text-[#121212]' : 'text-[#6b7280]'
                      }`}
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                      Email Address
                    </label>
                    <input
                      type="text"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className={`w-full h-7.5 sm:h-8 px-2.5 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors focus:outline-none focus:border-[#121212] placeholder-[#6b7280] ${
                        emailAddress ? 'text-[#121212]' : 'text-[#6b7280]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Booking & Payment Source Panel */}
              <div className="bg-[#fbfaf1] border border-[#dedbc4] rounded-xl p-2.5 sm:p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {/* Booking Source Custom Dropdown */}
                  <div className="relative" ref={bookingSourceRef}>
                    <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                      Booking Source
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBookingSourceOpen(!isBookingSourceOpen);
                        setIsPaymentMethodOpen(false);
                      }}
                      className={`w-full h-7.5 sm:h-8 pl-2.5 pr-2 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer ${
                        bookingSource ? 'text-[#121212] font-medium' : 'text-[#6b7280]'
                      }`}
                    >
                      <span className="truncate">{bookingSource || 'Select Booking Source'}</span>
                      <ChevronDown className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0 ml-1" />
                    </button>

                    {/* Popover */}
                    {isBookingSourceOpen && (
                      <div className="absolute top-full mt-1 left-0 z-50 w-full max-h-36 overflow-y-auto bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                        {BOOKING_SOURCES.map((source) => {
                          const isSelected = bookingSource === source;
                          return (
                            <button
                              key={source}
                              type="button"
                              onClick={() => {
                                setBookingSource(source);
                                setIsBookingSourceOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? 'bg-[#fbfaf1] text-[#121212] font-bold'
                                  : 'text-[#121212] hover:bg-neutral-50'
                              }`}
                            >
                              <span>{source}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[2] text-[#121212]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Payment Method Custom Dropdown */}
                  <div className="relative" ref={paymentMethodRef}>
                    <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                      Payment Method
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaymentMethodOpen(!isPaymentMethodOpen);
                        setIsBookingSourceOpen(false);
                      }}
                      className={`w-full h-7.5 sm:h-8 pl-2.5 pr-2 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer ${
                        paymentMethod ? 'text-[#121212] font-medium' : 'text-[#6b7280]'
                      }`}
                    >
                      <span className="truncate">{paymentMethod || 'Select Payment Method'}</span>
                      <ChevronDown className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0 ml-1" />
                    </button>

                    {/* Popover */}
                    {isPaymentMethodOpen && (
                      <div className="absolute top-full mt-1 left-0 z-50 w-full max-h-36 overflow-y-auto bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                        {PAYMENT_METHODS.map((method) => {
                          const isSelected = paymentMethod === method;
                          return (
                            <button
                              key={method}
                              type="button"
                              onClick={() => {
                                setPaymentMethod(method);
                                setIsPaymentMethodOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? 'bg-[#fbfaf1] text-[#121212] font-bold'
                                  : 'text-[#121212] hover:bg-neutral-50'
                              }`}
                            >
                              <span>{method}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[2] text-[#121212]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes (spanning full width, two-liner textarea) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#121212] mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any relevant details here..."
                    className={`w-full h-13 sm:h-14 py-1.5 px-2.5 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs transition-colors focus:outline-none focus:border-[#121212] placeholder-[#6b7280] resize-none leading-relaxed ${
                      notes ? 'text-[#121212]' : 'text-[#6b7280]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Dedicated Side-by-Side Booking Summary Card (Only exact lines from Figma prototype) */}
            <div className="md:col-span-5 h-full flex flex-col justify-between">
              <div className="border border-dashed border-[#dedbc4] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between h-full bg-[#fbfaf1]/40">
                <div className="space-y-2 text-xs sm:text-[11.5px]">
                  <div className="flex items-center justify-between text-[#4a4a42]">
                    <span>Court Rate</span>
                    <span className="font-semibold text-[#121212] tabular-nums">₱ {courtRate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#4a4a42]">
                    <span>Additional Players ({additionalPlayers} x ₱ 100)</span>
                    <span className="font-semibold text-[#121212] tabular-nums">₱ {additionalPlayersCost}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#4a4a42]">
                    <span>Paddle Rental ({paddleRental} x ₱ 100)</span>
                    <span className="font-semibold text-[#121212] tabular-nums">₱ {paddleRentalCost}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#4a4a42]">
                    <span>Ball Rental ({ballRental} x ₱ 50)</span>
                    <span className="font-semibold text-[#121212] tabular-nums">₱ {ballRentalCost}</span>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="pt-3 mt-3 border-t border-[#dedbc4]/80 flex items-center justify-between text-xs sm:text-[12.5px]">
                  <span className="font-bold text-[#121212]">
                    TOTAL
                  </span>
                  <span className="font-extrabold text-[#121212] tabular-nums">
                    ₱ {totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal separator before the button line color: #dedbc4 */}
        <div className="w-full h-px bg-[#dedbc4] mt-2.5 mb-2.5" />

        {/* Action Buttons: circular/pill rounded-full design */}
        <div className="w-full flex items-center justify-between">
          {/* Back button */}
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {/* Next or Confirm button */}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
