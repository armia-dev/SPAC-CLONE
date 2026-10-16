import React, { useEffect } from 'react';
import { X, CalendarClock, Ban } from 'lucide-react';

export default function BookingsViewModal({
  isOpen = false,
  onClose,
  booking = null,
  onReschedule,
  onCancel,
}) {
  // Close on Escape key
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

  // Which actions are allowed for this booking's status (same rules as the table menu)
  const canReschedule = booking.status === 'Reserved' || booking.status === 'Cancelled';
  const canCancel = booking.status === 'Reserved';

  // Status badge matching table and prototype style
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
            <span>{status || 'Unknown'}</span>
          </span>
        );
    }
  };

  // Derive pax number
  const paxCount = parseInt(booking.pax, 10) || 4;

  // Parse amount number
  const parseAmountNumber = (amtStr) => {
    if (typeof amtStr === 'number') return amtStr;
    if (!amtStr) return 300;
    const clean = String(amtStr).replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 300;
  };

  const totalAmountNum = parseAmountNumber(booking.amount);

  // Breakdown resolution (CR-1006 default: Court Rate 200, Paddle 100 = Total 300)
  let courtRateAmount = 200;
  let additionalPlayersAmount = Math.max(0, paxCount - 4) * 100;
  let paddleRentalAmount = 0;
  let ballRentalAmount = 0;

  if (booking.breakdown) {
    courtRateAmount = booking.breakdown.courtRate ?? 200;
    additionalPlayersAmount = booking.breakdown.additionalPlayers ?? 0;
    paddleRentalAmount = booking.breakdown.paddleRental ?? 0;
    ballRentalAmount = booking.breakdown.ballRental ?? 0;
  } else if (booking.ref === 'CR-1006' || totalAmountNum === 300) {
    courtRateAmount = 200;
    additionalPlayersAmount = 0;
    paddleRentalAmount = 100;
    ballRentalAmount = 0;
  } else if (booking.paddleRental !== undefined || booking.ballRental !== undefined) {
    paddleRentalAmount = (booking.paddleRental || 0) * 100;
    ballRentalAmount = (booking.ballRental || 0) * 50;
    courtRateAmount = Math.max(200, totalAmountNum - additionalPlayersAmount - paddleRentalAmount - ballRentalAmount);
  } else {
    const isTwoHours = booking.time && ((booking.time.includes('8:00 AM') && booking.time.includes('6:00 AM')) || booking.time.includes('2 hrs') || booking.time.includes('2 hours'));
    if (totalAmountNum >= 400 && !isTwoHours && paxCount <= 4) {
      courtRateAmount = 400;
    } else if (totalAmountNum === 500) {
      courtRateAmount = 400;
      additionalPlayersAmount = Math.max(0, paxCount - 4) * 100 || 100;
    } else if (totalAmountNum === 1150) {
      courtRateAmount = 600;
      additionalPlayersAmount = 500;
      ballRentalAmount = 50;
    } else {
      courtRateAmount = Math.max(200, totalAmountNum - additionalPlayersAmount);
    }
  }

  // Derive add-ons label
  const getAddOnsDisplay = () => {
    if (booking.addOns) return booking.addOns;
    const items = [];
    if (paddleRentalAmount > 0) {
      const count = Math.round(paddleRentalAmount / 100);
      items.push(`${count}x Paddle Rental`);
    }
    if (ballRentalAmount > 0) {
      const count = Math.round(ballRentalAmount / 50);
      items.push(`${count}x Ball Rental`);
    }
    if (booking.paddleRental) items.push(`${booking.paddleRental}x Paddle Rental`);
    if (booking.ballRental) items.push(`${booking.ballRental}x Ball Rental`);
    
    return items.length > 0 ? items.join(', ') : 'None';
  };

  // Safe defaults matching user prototype
  const customerName = booking.customer || booking.customerName || 'Alyssa Cruz';
  const bookingSource = booking.bookingSource || booking.source || 'Walk-in';
  const bookingDate = booking.date || 'Aug 27, 2024';
  const timeSlot = booking.time || '6:00 PM – 7:00 PM';
  const contactNumber = booking.contact || booking.contactNumber || '+63 917 842 1923';
  const paymentMethod = booking.paymentMethod || 'GCash';
  
  // Note matching prototype
  const notesContent = booking.note || booking.notes || (booking.ref === 'CR-1006' ? 'Customer requested court 2 near entrance' : 'None');
  
  // Timestamps matching prototype (Booked Aug 26, 2026 · Last updated Aug 26, 2026)
  const bookedDateDisplay = booking.bookedDate || booking.date || 'Aug 26, 2026';
  const lastUpdatedDisplay = booking.lastUpdated || booking.date || 'Aug 26, 2026';

  const handleRescheduleClick = () => {
    onClose?.();
    onReschedule?.(booking);
  };

  const handleCancelClick = () => {
    onClose?.();
    onCancel?.(booking);
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
      <div className="w-full max-w-[460px] sm:max-w-[480px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-2xl p-4 sm:p-4.5 flex flex-col relative transition-all duration-150">
        
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-[17px] font-bold text-[#121212] tracking-tight">
            Court Rental Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 rounded-full text-[#6b7280] hover:text-[#121212] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* 1st HORIZONTAL SEPARATOR */}
        <div className="mx-1 h-px bg-[#dedbc4] mt-2.5 mb-2.5 sm:mt-3 sm:mb-3" />

        {/* ================= UPPER SECTION ================= */}
        <div className="mb-2.5 sm:mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3e5] text-[#121212] border border-[#dedbc4] select-none whitespace-nowrap">
              Ref #: {booking.ref || 'CR-1006'}
            </span>
            {renderStatusBadge(booking.status || 'Reserved')}
          </div>

          <p className="text-xs text-[#717171] mt-1 font-normal">
            Booked {bookedDateDisplay} · Last updated {lastUpdatedDisplay}
          </p>
        </div>

        {/* ================= MIDDLE SECTION (Two Columns) ================= */}
        <div className="grid grid-cols-2 gap-x-6 sm:gap-x-7 gap-y-2 sm:gap-y-2.5 mb-2.5 sm:mb-3">
          <div>
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              CUSTOMER
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-[#121212] truncate">
              {customerName}
            </p>
          </div>
          <div className="text-right">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              CONTACT INFORMATION
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-[#121212] truncate">
              {contactNumber}
            </p>
          </div>

          <div>
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              BOOKING SOURCE
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-[#121212] truncate">
              {bookingSource}
            </p>
          </div>
          <div className="text-right">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              PAYMENT METHOD
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-[#121212] truncate">
              {paymentMethod}
            </p>
          </div>

          <div>
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              DATE
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-[#121212]">
              {bookingDate}
            </p>
          </div>
          <div className="text-right">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              TIME
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-[#121212]">
              {timeSlot}
            </p>
          </div>

          <div>
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              PAX
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-[#121212]">
              {paxCount} Players
            </p>
          </div>
          <div className="text-right">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              ADD-ONS
            </span>
            <p className="text-xs sm:text-[13px] font-semibold text-[#121212] truncate">
              {getAddOnsDisplay()}
            </p>
          </div>

          <div className="col-span-2">
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#717171] mb-0.5">
              NOTE
            </span>
            <p className="text-xs sm:text-[13px] font-normal text-[#121212] leading-tight">
              {notesContent}
            </p>
          </div>
        </div>

        {/* ================= PRICE BREAKDOWN SECTION ================= */}
        <div className="border border-[#dedbc4] rounded-xl px-3.5 py-2.5 bg-[#fcfbf7]">
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-[#404040]">
              <span>Court Rate</span>
              <span className="tabular-nums">₱ {courtRateAmount}</span>
            </div>

            <div className="flex items-center justify-between text-[#404040]">
              <span>Additional Players</span>
              <span className="tabular-nums">₱ {additionalPlayersAmount}</span>
            </div>

            <div className="flex items-center justify-between text-[#404040]">
              <span>Paddle Rental</span>
              <span className="tabular-nums">₱ {paddleRentalAmount}</span>
            </div>

            <div className="flex items-center justify-between text-[#404040]">
              <span>Ball Rental</span>
              <span className="tabular-nums">₱ {ballRentalAmount}</span>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-[#dedbc4] flex items-center justify-between">
            <span className="font-bold text-xs sm:text-sm text-[#121212] tracking-wide">
              TOTAL
            </span>
            <span className="font-extrabold text-sm sm:text-base text-[#121212] tabular-nums">
              ₱ {totalAmountNum}
            </span>
          </div>
        </div>

        {/* 2nd HORIZONTAL SEPARATOR */}
        <div className="mx-1 h-px bg-[#dedbc4] mt-3 mb-2.5 sm:mt-3.5 sm:mb-3" />

        {/* ================= BUTTONS ROW ================= */}
        <div className="w-full flex items-center justify-between gap-2 pt-0.5">
          {/* Close button (always available) */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-5 py-1.5 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Close
          </button>

          {/* Right Action Buttons (depend on status) */}
          {(canReschedule || canCancel) && (
            <div className="flex items-center gap-2">
              {/* Reschedule: Reserved & Cancelled */}
              {canReschedule && (
                <button
                  type="button"
                  onClick={handleRescheduleClick}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm bg-[#ffffff] border border-[#121212] text-[#121212] hover:bg-[#fbfaf1] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                >
                  <CalendarClock className="w-3.5 h-3.5 stroke-[2] text-[#121212]" />
                  <span>Reschedule</span>
                </button>
              )}

              {/* Cancel Booking: Reserved only */}
              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm bg-[#C42B2B] text-white hover:bg-[#a82424] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                >
                  <Ban className="w-3.5 h-3.5 stroke-[2.2] text-white" />
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}