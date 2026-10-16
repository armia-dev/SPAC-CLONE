import React from 'react';
import { Check, ChevronLeft, Lock, Download } from 'lucide-react';

export default function Receipt({
  bookingData,
  paymentDetails,
  calculatedTotal,
  onBackToBooking,
  onGoToBookings,
}) {
  const referenceNumber =
    paymentDetails?.referenceNumber || bookingData?.referenceNumber || 'CR-1009';
  const paidVia = paymentDetails?.paymentMethod || 'GCash';
  const paidTimestamp = paymentDetails?.paidAt || 'Paid Aug 12, 2026 • 3:41 PM';

  const selectedDay = bookingData?.day || 19;
  const selectedMonth = (bookingData?.month || 'August').slice(0, 3);
  const selectedYear = bookingData?.year || 2026;
  const startTime = bookingData?.startTime || '8:00 AM';
  const duration = bookingData?.duration || 1;
  const players = bookingData?.players || 4;
  const paddles = bookingData?.paddles || 2;
  const balls = bookingData?.balls || 1;

  // Format time range e.g. "8:00–9:00 AM"
  const timeFormatted = `${startTime} (${duration} ${duration === 1 ? 'hr' : 'hrs'})`;

  const handleDownload = () => {
    // Generate simple readable text receipt download
    const receiptContent = `=========================================
SARANAY PICKLEBALL COURT - OFFICIAL RECEIPT
=========================================
Payment Status: CONFIRMED
Reference Number: ${referenceNumber}
Paid Via: ${paidVia}
Paid Date: ${paidTimestamp}
Total Amount: ₱${calculatedTotal.toFixed(2)}

BOOKING DETAILS:
Date: ${selectedMonth} ${selectedDay}, ${selectedYear}
Time: ${timeFormatted}
Players: ${players} players
Equipment: ${paddles} paddles, ${balls} balls

LOCATION:
Saranay Homes, Block 5 Lot 13 Saranay Road,
Bagumbong, North Caloocan
Contact: 0927-045-8745 / 0906-545-8384
=========================================
Thank you for playing with us!
=========================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Saranay-Receipt-${referenceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

    return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="w-full min-w-0 flex flex-col text-neutral-900"
    >
      {/* Receipt header: full-bleed, edge to edge */}
      <nav className="w-screen ml-[calc(50%-50vw)] -mt-5 sm:-mt-6 bg-[#121212] text-white shrink-0 shadow-sm">
        <div className="max-w-[1520px] mx-auto px-5 sm:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/saranay-logo.png"
              alt="Saranay Pickleball"
              className="h-9 sm:h-10 w-auto object-contain"
              onError={(e) => {
                const t = e.currentTarget;
                if (t.src.endsWith('/saranay-logo.png')) t.src = '/SARANAY LOGO.png';
              }}
            />
            <span className="font-extrabold tracking-wide text-sm sm:text-lg uppercase text-white">
              SARANAY PICKLEBALL
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-400 font-medium">
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
            <span>Secure checkout</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}

      {/* Main Container */}
      <div className="max-w-[1020px] w-full mx-auto px-5 sm:px-8 py-8 flex-1 flex flex-col items-center">
        {/* Back Link */}
        <div className="w-full max-w-[480px] mb-4">
          <button
            type="button"
            onClick={onBackToBooking}
            className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-black cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to booking
          </button>
        </div>

        {/* Centered Receipt Card */}
        <div className="w-full max-w-[480px] bg-white border border-[#E7E5DC] rounded-3xl p-7 sm:p-9 shadow-lg text-center animate-fadeIn">
          {/* Green Checkmark Circle */}
          <div className="w-14 h-14 mx-auto rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center mb-4 shadow-xs">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#171717] tracking-tight leading-tight">
            Payment confirmed
          </h2>
          <p className="text-sm text-neutral-500 mt-1 font-normal">
            Your court is booked and ready to go.
          </p>

          {/* Large Price Display */}
          <div className="mt-5">
            <div className="text-3xl sm:text-[38px] font-extrabold text-[#121212] tracking-tight leading-none">
              ₱{calculatedTotal.toFixed(2)}
            </div>
            <div className="text-xs text-neutral-500 mt-1.5 font-medium">
              {paidTimestamp}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-100 my-5" />

          {/* Reference & Payment Channel */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Reference number</span>
              <span className="font-bold text-[#171717]">{referenceNumber}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Paid via</span>
              <span className="bg-[#dcfce7] text-[#166534] font-bold text-xs px-3 py-1 rounded-md">
                {paidVia}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-100 my-5" />

          {/* Booking Details Box */}
          <div className="bg-[#FAF8EE] border border-[#E8DFC7] rounded-xl p-4 text-left text-xs sm:text-sm space-y-2">
            <div className="text-[10px] font-extrabold text-[#745E12] uppercase tracking-wider mb-1">
              BOOKING DETAILS
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Date</span>
              <span className="font-semibold text-neutral-900">
                {selectedMonth} {selectedDay}, {selectedYear}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Time</span>
              <span className="font-semibold text-neutral-900">
                {timeFormatted}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Players</span>
              <span className="font-semibold text-neutral-900">
                {players} {players === 1 ? 'player' : 'players'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Equipment</span>
              <span className="font-semibold text-neutral-900">
                {paddles} {paddles === 1 ? 'paddle' : 'paddles'}, {balls} {balls === 1 ? 'ball' : 'balls'}
              </span>
            </div>
          </div>

          {/* Download Receipt Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold py-3.5 rounded-xl text-sm sm:text-base mt-6 shadow-md cursor-pointer transition-all hover:scale-[1.01] active:scale-99 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
            Download receipt
          </button>

          {/* Bottom Link */}
          <p className="mt-4 text-xs text-neutral-500">
            View this booking anytime from{' '}
            <button
              type="button"
              onClick={onGoToBookings || onBackToBooking}
              className="text-neutral-800 font-semibold underline hover:text-[#745E12] cursor-pointer"
            >
              My bookings
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
}
