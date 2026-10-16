import React from 'react';

export default function BookingStep2({
  bookingData,
  updateBookingData,
  onBack,
  onNext,
  calculatedTotal,
}) {
  const players = bookingData.players || 4;
  const paddles = bookingData.paddles || 2;
  const balls = bookingData.balls || 1;

  const handlePlayersChange = (delta) => {
    const updated = Math.max(1, Math.min(24, players + delta));
    updateBookingData({ players: updated });
  };

  const handlePaddlesChange = (delta) => {
    const updated = Math.max(0, Math.min(16, paddles + delta));
    updateBookingData({ paddles: updated });
  };

  const handleBallsChange = (delta) => {
    const updated = Math.max(0, Math.min(10, balls + delta));
    updateBookingData({ balls: updated });
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

          {/* Step 2 - Active (Lime) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center font-bold text-black text-sm ring-4 ring-white shadow-xs">
              2
            </div>
            <span className="mt-2 text-[11px] sm:text-xs font-bold text-black tracking-wider uppercase">
              PLAYERS & GEAR
            </span>
          </div>

          {/* Step 3 - Inactive */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F7F6F0] border border-neutral-300 flex items-center justify-center font-semibold text-neutral-600 text-sm ring-4 ring-white">
              3
            </div>
            <span className="mt-2 text-[11px] sm:text-xs font-semibold text-neutral-500 tracking-wider uppercase">
              REVIEW & CONFIRM
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-left mb-6">
        <h2 className="text-2xl sm:text-[30px] font-extrabold text-[#111827] tracking-tight leading-tight">
          Who’s playing, and what do you need?
        </h2>
        <p className="text-sm sm:text-base text-neutral-500 mt-1.5 font-normal">
          Add players and rent paddles or balls if you don't have your own.
        </p>
      </div>

      {/* Selectors Stack */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Row 1: No. of Players */}
        <div className="bg-[#F7F6F0] border border-[#E7E5DC] rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-2xs">
          <div>
            <h3 className="text-lg font-bold text-[#171717] leading-snug">
              No. of Players
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Extra players beyond your court limit: ₱100 each
            </p>
          </div>

          {/* Stepper Controller */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => handlePlayersChange(-1)}
              disabled={players <= 1}
              className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-lg font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
              aria-label="Decrease players"
            >
              -
            </button>
            <span className="w-5 text-center text-lg font-bold text-[#171717]">
              {players}
            </span>
            <button
              type="button"
              onClick={() => handlePlayersChange(1)}
              className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-lg font-semibold text-neutral-800 hover:bg-neutral-50 shadow-2xs cursor-pointer transition-colors"
              aria-label="Increase players"
            >
              +
            </button>
          </div>
        </div>

        {/* Row 2: Paddle Rental */}
        <div className="bg-[#F7F6F0] border border-[#E7E5DC] rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-2xs">
          <div>
            <h3 className="text-lg font-bold text-[#171717] leading-snug">
              Paddle
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              ₱100 / session
            </p>
          </div>

          {/* Stepper Controller */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => handlePaddlesChange(-1)}
              disabled={paddles <= 0}
              className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-lg font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
              aria-label="Decrease paddles"
            >
              -
            </button>
            <span className="w-5 text-center text-lg font-bold text-[#171717]">
              {paddles}
            </span>
            <button
              type="button"
              onClick={() => handlePaddlesChange(1)}
              className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-lg font-semibold text-neutral-800 hover:bg-neutral-50 shadow-2xs cursor-pointer transition-colors"
              aria-label="Increase paddles"
            >
              +
            </button>
          </div>
        </div>

        {/* Row 3: Ball Rental */}
        <div className="bg-[#F7F6F0] border border-[#E7E5DC] rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-2xs">
          <div>
            <h3 className="text-lg font-bold text-[#171717] leading-snug">
              Ball
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              ₱50 / session
            </p>
          </div>

          {/* Stepper Controller */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => handleBallsChange(-1)}
              disabled={balls <= 0}
              className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-lg font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-colors"
              aria-label="Decrease balls"
            >
              -
            </button>
            <span className="w-5 text-center text-lg font-bold text-[#171717]">
              {balls}
            </span>
            <button
              type="button"
              onClick={() => handleBallsChange(1)}
              className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-lg font-semibold text-neutral-800 hover:bg-neutral-50 shadow-2xs cursor-pointer transition-colors"
              aria-label="Increase balls"
            >
              +
            </button>
          </div>
        </div>
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
            onClick={onNext}
            className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold px-8 py-2.5 rounded-full text-sm sm:text-base shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
