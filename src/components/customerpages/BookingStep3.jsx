import React, { useState } from 'react';

export default function BookingStep3({
  bookingData,
  onBack,
  onConfirm,
  calculatedTotal,
}) {
  const [agreed, setAgreed] = useState(true);
  const [policyError, setPolicyError] = useState(false);

  const selectedDay = bookingData.day || 19;
  const selectedMonth = bookingData.month || 'August';
  const selectedYear = bookingData.year || 2026;
  const startTime = bookingData.startTime || '08:00 AM';
  const duration = bookingData.duration || 1;
  const players = bookingData.players || 4;
  const paddles = bookingData.paddles || 2;
  const balls = bookingData.balls || 1;

  // Determine daytime vs nighttime
  const isNighttime =
    startTime.includes('PM') &&
    ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'].includes(startTime) ||
    startTime === '12:00 AM' ||
    startTime === '1:00 AM' ||
    startTime === '2:00 AM';

  const rateLabel = isNighttime ? 'Nighttime • ₱300/hr' : 'Daytime • ₱200/hr';

  const handleContinue = () => {
    if (!agreed) {
      setPolicyError(true);
      return;
    }
    onConfirm();
  };

  return (
    <div className="w-full flex flex-col">
      {/* Stepper Progress Bar */}
      <div className="w-full max-w-[576px] mx-auto pb-8 mb-6 border-b border-neutral-100 relative">
        <div className="relative flex items-center justify-between">
          {/* Connector Line */}
          <div className="absolute left-[40px] right-[40px] top-[20px] h-[2px] bg-neutral-200 z-0" />

          {/* Step 1 - Completed (Black) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center font-bold text-white text-sm ring-4 ring-white shadow-xs">
              1
            </div>
            <span className="mt-2 text-[11px] sm:text-xs font-bold text-black tracking-wider uppercase">
              DATE & TIME
            </span>
          </div>

          {/* Step 2 - Completed (Black) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center font-bold text-white text-sm ring-4 ring-white shadow-xs">
              2
            </div>
            <span className="mt-2 text-[11px] sm:text-xs font-bold text-black tracking-wider uppercase">
              PLAYERS & GEAR
            </span>
          </div>

          {/* Step 3 - Active (Lime) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center font-bold text-black text-sm ring-4 ring-white shadow-xs">
              3
            </div>
            <span className="mt-2 text-[11px] sm:text-xs font-bold text-black tracking-wider uppercase">
              REVIEW & CONFIRM
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-left mb-6">
        <h2 className="text-2xl sm:text-[30px] font-extrabold text-[#111827] tracking-tight leading-tight">
          Review your booking
        </h2>
        <p className="text-sm sm:text-base text-neutral-500 mt-1.5 font-normal">
          Check the details below before you confirm.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-[#F7F6F0] border border-[#E7E5DC] rounded-2xl p-6 sm:p-8 space-y-3.5 mb-5 shadow-2xs">
        {/* Row 1: Date */}
        <div className="flex items-center justify-between border-b border-dashed border-[#D6CFBE] pb-3.5 text-sm">
          <span className="font-medium text-neutral-500">Date</span>
          <span className="font-bold text-[#171717]">
            {selectedMonth} {selectedDay}, {selectedYear}
          </span>
        </div>

        {/* Row 2: Time */}
        <div className="flex items-center justify-between border-b border-dashed border-[#D6CFBE] pb-3.5 text-sm">
          <span className="font-medium text-neutral-500">Time</span>
          <span className="font-bold text-[#171717]">
            {startTime} • {duration} {duration === 1 ? 'hr' : 'hrs'}
          </span>
        </div>

        {/* Row 3: Rate */}
        <div className="flex items-center justify-between border-b border-dashed border-[#D6CFBE] pb-3.5 text-sm">
          <span className="font-medium text-neutral-500">Rate</span>
          <span className="font-semibold text-[#171717]">{rateLabel}</span>
        </div>

        {/* Row 4: Players */}
        <div className="flex items-center justify-between border-b border-dashed border-[#D6CFBE] pb-3.5 text-sm">
          <span className="font-medium text-neutral-500">Players</span>
          <span className="font-bold text-[#171717]">{players}</span>
        </div>

        {/* Row 5: Paddle rental */}
        <div className="flex items-center justify-between border-b border-dashed border-[#D6CFBE] pb-3.5 text-sm">
          <span className="font-medium text-neutral-500">Paddle rental</span>
          <span className="font-semibold text-[#171717]">
            {paddles} × ₱100
          </span>
        </div>

        {/* Row 6: Ball rental */}
        <div className="flex items-center justify-between border-b border-dashed border-[#D6CFBE] pb-3.5 text-sm">
          <span className="font-medium text-neutral-500">Ball rental</span>
          <span className="font-semibold text-[#171717]">
            {balls} × ₱50
          </span>
        </div>

        {/* Row 7: Total */}
        <div className="flex items-center justify-between pt-1 text-sm sm:text-base">
          <span className="font-medium text-neutral-600">Total</span>
          <span className="font-extrabold text-[#171717]">
            ₱{calculatedTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Policy Agreement Checkbox */}
      <div className="mb-8">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setPolicyError(false);
            }}
            className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-black focus:ring-[#ccff00] cursor-pointer"
          />
          <span className="text-xs sm:text-[13px] text-neutral-600 leading-snug">
            I agree to the <span className="font-semibold text-neutral-900">booking policy</span> — cancellations less than 24 hours before the schedule are not allowed, and bookings are transferable but non-refundable.
          </span>
        </label>
        {policyError && (
          <p className="text-xs text-red-600 mt-1.5 ml-7">
            Please check the box to agree to the booking policy before continuing.
          </p>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-[#111411] text-white rounded-2xl px-6 py-5 flex items-center justify-between shadow-md">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            TOTAL AMOUNT
          </div>
          <div className="text-2xl sm:text-[30px] font-extrabold text-[#ccff00] leading-none mt-1">
            ₱{calculatedTotal.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="border border-[#404040] hover:bg-neutral-800 text-[#D1D5DB] font-semibold px-6 py-2.5 rounded-full text-sm cursor-pointer transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold px-7 py-2.5 rounded-full text-sm sm:text-base shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
