import React, { useState } from 'react';
import { Lock, ChevronUp, ChevronDown, ChevronLeft, QrCode } from 'lucide-react';

/**
 * PaymentPage
 * Rendered inside CustomerMainForm's content panel, which already provides the
 * page background, font loading and horizontal/vertical padding. This component
 * therefore sets no page background, min-h-screen or outer padding.
 *
 * `showCheckoutBar` renders the dark "SARANAY PICKLEBALL / Secure checkout" strip
 * from the design. Pass showCheckoutBar={false} if you don't want it on top of
 * the main site header.
 */

const OLIVE = '#85761C';
const OLIVE_DARK = '#6B5E12';
const FIELD_BG = '#FBFAF5';
const FIELD_BORDER = '#E9E5D3';
const CARD_BORDER = '#E7E3D0';

function LogoImg({ className }) {
  return (
    <img
      src="/saranay-logo.png"
      alt="Saranay Pickleball Court"
      className={className}
      onError={(e) => {
        const t = e.currentTarget;
        if (t.src.endsWith('/saranay-logo.png')) t.src = '/SARANAY LOGO.png';
      }}
    />
  );
}

function GCashIcon() {
  return (
    <div className="w-9 h-9 rounded-lg bg-[#0B5FE8] text-white flex flex-col items-center justify-center shrink-0 leading-none">
      <span className="font-black text-[15px] -mb-0.5">G</span>
      <span className="font-bold text-[7px] tracking-tight">GCash</span>
    </div>
  );
}

function Radio({ checked }) {
  return (
    <span
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        checked ? 'border-[#A3B81A]' : 'border-[#CFCBB8]'
      } bg-white`}
    >
      {checked && <span className="w-2.5 h-2.5 rounded-full bg-[#A3B81A]" />}
    </span>
  );
}

function Field({ label, type = 'text', value, onChange, autoComplete }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#121212] mb-1.5">{label}</label>
      <input
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        style={{ backgroundColor: FIELD_BG, borderColor: FIELD_BORDER }}
        className="w-full border rounded-[14px] px-4 py-3 text-sm sm:text-[15px] text-neutral-600 focus:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:bg-white transition-colors"
      />
    </div>
  );
}

// "08:00 AM" + 1 hr  ->  "8:00–9:00 AM"
function formatTimeRange(startStr, duration) {
  const m = String(startStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return `${startStr} (${duration} ${duration === 1 ? 'hr' : 'hrs'})`;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  const minutes = m[2];
  const fmt = (hour24) => {
    const mer = hour24 % 24 >= 12 ? 'PM' : 'AM';
    const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return { text: `${h12}:${minutes}`, mer };
  };
  const a = fmt(h);
  const b = fmt(h + duration);
  return a.mer === b.mer ? `${a.text}–${b.text} ${b.mer}` : `${a.text} ${a.mer}–${b.text} ${b.mer}`;
}

export default function PaymentPage({
  bookingData,
  calculatedTotal,
  onBack,
  onPaymentSuccess,
  showCheckoutBar = true,
}) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [fullName, setFullName] = useState('Crystal Florano');
  const [email, setEmail] = useState('crystalflorano@gmail.com');
  const [contactNumber, setContactNumber] = useState('09938795878');
  const [isProcessing, setIsProcessing] = useState(false);

  const referenceNumber = bookingData.referenceNumber || 'CR-1009';
  const day = bookingData.day || 19;
  const month = (bookingData.month || 'August').slice(0, 3);
  const year = bookingData.year || 2026;
  const startTime = bookingData.startTime || '8:00 AM';
  const duration = bookingData.duration || 1;
  const players = bookingData.players || 4;
  const paddles = bookingData.paddles ?? 2;
  const balls = bookingData.balls ?? 1;

  const methodLabel = paymentMethod === 'gcash' ? 'GCash' : 'QR Ph';
  const [wholeStr, cents] = Number(calculatedTotal).toFixed(2).split('.');
  const whole = Number(wholeStr).toLocaleString('en-US');
  const totalText = `₱${Number(calculatedTotal).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        fullName,
        email,
        contactNumber,
        paymentMethod: methodLabel,
        referenceNumber,
        paidAt: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      });
    }, 800);
  };

  const methodClass = (active) =>
    `w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-[14px] text-left cursor-pointer transition-colors border-2 ${
      active ? 'bg-[#EEF5CC] border-[#A3B81A]' : 'hover:border-[#D8D3BC]'
    }`;

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

      <div className="w-full max-w-[1000px] mx-auto">
        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-neutral-600 hover:text-black mb-5 cursor-pointer w-fit transition-colors"
        >
          <ChevronLeft className="w-4 h-15" strokeWidth={2.2} />
          Back to booking
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-5 sm:gap-6 items-start">
          {/* LEFT: summary */}
          <div
            style={{ borderColor: CARD_BORDER }}
            className="bg-white border rounded-[28px] px-5 sm:px-6 py-6 sm:py-7"
          >
            <div className="flex items-center gap-5 pb-6">
              <LogoImg className="h-12 w-auto max-w-[96px] object-contain shrink-0" />
              <div>
                <h3 className="font-bold text-[#121212] text-base sm:text-lg leading-tight">Saranay Pickleball</h3>
                <p className="text-sm text-neutral-500 mt-0.5">Court rental</p>
              </div>
            </div>

            <div>
              <div style={{ color: OLIVE }} className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em]">
                Total amount
              </div>
              <div className="mt-1 flex items-baseline text-[#121212]">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">₱{whole}</span>
                <span className="text-lg sm:text-xl font-semibold text-neutral-500 ml-0.5">.{cents}</span>
              </div>
            </div>

            <div className="mt-5 pb-3 border-b" style={{ borderColor: CARD_BORDER }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Reference number</span>
                <span
                  style={{ color: OLIVE_DARK }}
                  className="bg-[#EAF0C4] font-bold text-xs sm:text-[13px] px-3 py-1 rounded-full tracking-wider"
                >
                  {referenceNumber}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                aria-expanded={detailsOpen}
                className="w-full flex items-center justify-between text-xs sm:text-[13px] font-bold text-[#121212] uppercase tracking-[0.12em] py-1 cursor-pointer"
              >
                <span>Booking details</span>
                {detailsOpen ? (
                  <ChevronUp className="w-4 h-4 text-neutral-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-600" />
                )}
              </button>

              {detailsOpen && (
                <div
                  style={{ borderColor: '#E9D98F', color: OLIVE }}
                  className="mt-3 bg-[#FCF4DF] border rounded-2xl px-4 sm:px-5 py-4 text-sm sm:text-[15px] space-y-2.5"
                >
                  {[
                    ['Date', `${month} ${day}, ${year}`],
                    ['Time', formatTimeRange(startTime, duration)],
                    ['Players', `${players} ${players === 1 ? 'player' : 'players'}`],
                    [
                      'Equipment',
                      `${paddles} ${paddles === 1 ? 'paddle' : 'paddles'}, ${balls} ${balls === 1 ? 'ball' : 'balls'}`,
                    ],
                    ['Fees', 'Free'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <span>{k}</span>
                      <span className="font-bold text-right">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-3 pt-3 border-t" style={{ borderColor: '#E9D98F' }}>
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-[#121212]">{totalText}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: contact + payment */}
          <form
            onSubmit={handlePay}
            style={{ borderColor: CARD_BORDER }}
            className="bg-white border rounded-[28px] px-5 sm:px-6 py-6 sm:py-7"
          >
            <h3 className="text-sm sm:text-[15px] font-bold uppercase tracking-[0.14em] text-[#121212]">
              Contact details
            </h3>
            <p className="text-sm text-neutral-500 mt-0.5 mb-5">We'll send your booking confirmation here.</p>

            <div className="space-y-4">
              <Field label="Full name" value={fullName} onChange={setFullName} autoComplete="name" />
              <Field label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" />
              <Field label="Contact number" type="tel" value={contactNumber} onChange={setContactNumber} autoComplete="tel" />
            </div>

            <h3 className="mt-8 text-sm sm:text-[15px] font-bold uppercase tracking-[0.14em] text-[#121212]">
              Payment method
            </h3>
            <p className="text-sm text-neutral-500 mt-0.5 mb-4">Choose how you'd like to pay.</p>

            <div role="radiogroup" aria-label="Payment method" className="space-y-3">
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === 'gcash'}
                onClick={() => setPaymentMethod('gcash')}
                style={paymentMethod === 'gcash' ? undefined : { backgroundColor: FIELD_BG, borderColor: FIELD_BORDER }}
                className={methodClass(paymentMethod === 'gcash')}
              >
                <span className="flex items-center gap-3.5">
                  <GCashIcon />
                  <span>
                    <span className="block font-bold text-base text-[#121212] leading-tight">GCash</span>
                    <span className="block text-sm text-neutral-500">Pay via GCash</span>
                  </span>
                </span>
                <Radio checked={paymentMethod === 'gcash'} />
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === 'qrph'}
                onClick={() => setPaymentMethod('qrph')}
                style={paymentMethod === 'qrph' ? undefined : { backgroundColor: FIELD_BG, borderColor: FIELD_BORDER }}
                className={methodClass(paymentMethod === 'qrph')}
              >
                <span className="flex items-center gap-3.5">
                  <span className="w-9 h-9 rounded-lg bg-white border border-[#E3DFCB] text-[#121212] flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block font-bold text-base text-[#121212] leading-tight">QR Ph</span>
                    <span className="block text-sm text-neutral-500">Scan with any bank or e-wallet app</span>
                  </span>
                </span>
                <Radio checked={paymentMethod === 'qrph'} />
              </button>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="mt-6 w-full bg-[#ccff00] hover:bg-[#b8e600] disabled:opacity-60 text-black font-bold py-4 rounded-full text-base sm:text-lg cursor-pointer transition-colors"
            >
              {isProcessing ? 'Processing payment...' : `Pay ${totalText} via ${methodLabel}`}
            </button>

            <div className="text-center text-xs sm:text-sm text-neutral-500 mt-5 space-y-2">
              <p>
                By continuing, you agree to PayMongo's{' '}
                <span className="underline text-[#121212] cursor-pointer">Privacy Policy</span>.
              </p>
              <p className="text-neutral-400">Powered by PayMongo</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}