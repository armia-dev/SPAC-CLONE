import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

const CANCELLATION_REASONS = [
  'Customer requested cancellation',
  'Inclement weather / Rain',
  'Court maintenance / Repairs',
  'Player conflict / Emergency',
  'Duplicate booking',
  'Other'
];

export default function BookingsCancelModal({
  isOpen = false,
  onClose,
  onBack,
  fromView = false,
  booking = null,
  onConfirmCancel,
}) {
  // Form States
  const [reason, setReason] = useState('');
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [error, setError] = useState('');

  // Ref for click outside
  const reasonRef = useRef(null);

  // Sync state on booking load
  useEffect(() => {
    if (booking && isOpen) {
      setReason('');
      setIsReasonOpen(false);
      setNotes('');
      setNotifyCustomer(true);
      setShowCancellationPolicy(false);
      setError('');
    }
  }, [booking, isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (reasonRef.current && !reasonRef.current.contains(event.target)) {
        setIsReasonOpen(false);
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

  if (!isOpen || !booking) return null;

  // Safe defaults matching user prototype
  const customerName = booking.customer || booking.customerName || 'Joseph Armia';
  const bookingRef = booking.ref || 'CR-1010';

  // Format Date & Time display: Aug 30, 2026 • 8:00 AM · 10:00 AM
  const formattedDateTime = (() => {
    const d = booking.date || 'Aug 30, 2026';
    let t = booking.time || '8:00 AM · 10:00 AM';
    t = t.replace('–', '·').replace('-', '·');
    return `${d} • ${t}`;
  })();

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!reason) {
      setError('Please select a cancellation reason');
      return;
    }

    onConfirmCancel?.({
      ...booking,
      status: 'Cancelled',
      lastUpdated: 'Today',
      cancellationReason: reason,
      cancellationNotes: notes || undefined,
      notifyCustomer,
    });
    onClose?.();
  };

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
            Cancel Booking
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
                onClick={() => setIsReasonOpen(!isReasonOpen)}
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
                  {CANCELLATION_REASONS.map((opt) => (
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

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#404040] mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant details here..."
                className="w-full h-18 sm:h-20 px-3 py-2 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs text-[#121212] placeholder-[#9ca3af] focus:outline-none focus:border-[#121212] transition-colors resize-none leading-relaxed"
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
              Cancellations made at least 24 hours prior to the reservation receive a 100% refund or court credit. Cancellations within 24 hours may incur a 50% reservation fee.
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

            {/* Confirm Cancellation button */}
            <button
              type="submit"
              className="px-6 sm:px-7 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#c42b2b] text-white hover:bg-[#a82424] active:scale-[0.98] transition-all cursor-pointer shadow-xs text-center"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}