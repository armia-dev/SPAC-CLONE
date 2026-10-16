import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

export default function EmailVerification({
  isOpen = true,
  onClose,
  email = 'ju***@email.com',
  maskedEmail,
  onVerifySuccess,
  onVerified,
  onResend,
}) {
  const displayEmail = maskedEmail || email;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendStatus, setResendStatus] = useState('');
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  if (isOpen === false) return null;

  const handleChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      return;
    }

    const char = cleanVal.slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setError('');

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }
    setCode(newCode);
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const entered = code.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    if (onVerified) {
      onVerified(entered);
    }
    if (onVerifySuccess) {
      onVerifySuccess(entered);
    }
    onClose();
  };

  const handleResend = () => {
    if (onResend) {
      onResend();
    }
    setResendStatus('A new code has been sent to your email!');
    setTimeout(() => setResendStatus(''), 4000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] sm:rounded-[36px] max-w-[490px] w-full p-8 sm:p-10 shadow-2xl relative border border-neutral-200 text-left"
      >
        {/* Close Button at Top Right with round border */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full border border-neutral-600 text-neutral-700 flex items-center justify-center hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Heading */}
        <h2 className="text-2xl sm:text-[30px] font-extrabold text-[#121212] tracking-tight uppercase leading-none">
          Check Your Email
        </h2>

        {/* Gray Underline */}
        <div className="h-[2px] bg-neutral-500 w-full mt-3.5 mb-4" />

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-neutral-600 font-normal leading-relaxed mb-7 sm:mb-8">
          We sent a 6-digit code to {displayEmail}. Enter it below to verify your email.
        </p>

        {/* Form */}
        <form onSubmit={handleVerify}>
          {/* 6 Digit Inputs */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 sm:w-14 h-16 sm:h-20 text-center text-2xl sm:text-3xl font-extrabold text-[#121212] bg-white border border-[#D5CCA8] rounded-xl sm:rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-black transition-all"
              />
            ))}
          </div>

          {error && <p className="text-xs text-red-600 font-semibold mb-4 text-center">{error}</p>}
          {resendStatus && (
            <p className="text-xs text-green-700 font-semibold mb-4 text-center">{resendStatus}</p>
          )}

          {/* Lime Verify Button */}
          <button
            type="submit"
            className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-base sm:text-lg tracking-wide py-3.5 sm:py-4 rounded-2xl shadow-xs border border-black cursor-pointer transition-all active:scale-[0.99] flex items-center justify-center uppercase"
          >
            Verify
          </button>

          {/* Footer Resend */}
          <div className="text-center mt-6 text-sm font-medium text-neutral-800">
            <span>Didn’t get it? </span>
            <button
              type="button"
              onClick={handleResend}
              className="font-bold underline hover:text-black cursor-pointer"
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
