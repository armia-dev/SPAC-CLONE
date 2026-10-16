import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword({
  isOpen = true,
  onClose,
  onResetSuccess,
  onReset,
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (isOpen === false) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSuccess(true);
    if (onReset) {
      onReset(newPassword);
    }
    if (onResetSuccess) {
      onResetSuccess(newPassword);
    }
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
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
          Reset Password
        </h2>

        {/* Gray Underline */}
        <div className="h-[2px] bg-neutral-500 w-full mt-3.5 mb-4" />

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-neutral-600 font-normal leading-relaxed mb-7 sm:mb-8">
          Create a secure password to keep your account safe.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              placeholder="New Password"
              className="w-full bg-white border border-[#D5CCA8] rounded-xl sm:rounded-2xl px-4 py-3.5 text-sm sm:text-base text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-black pr-12 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black cursor-pointer p-1"
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              ) : (
                <Eye className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Confirm New Password"
              className="w-full bg-white border border-[#D5CCA8] rounded-xl sm:rounded-2xl px-4 py-3.5 text-sm sm:text-base text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-black pr-12 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black cursor-pointer p-1"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              ) : (
                <Eye className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>
          </div>

          {error && <p className="text-xs text-red-600 font-semibold text-center">{error}</p>}
          {success && (
            <p className="text-xs text-green-700 font-semibold text-center">
              Password successfully reset!
            </p>
          )}

          {/* Lime Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-base sm:text-lg tracking-wide py-3.5 sm:py-4 rounded-2xl shadow-xs border border-black cursor-pointer transition-all active:scale-[0.99] flex items-center justify-center uppercase"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
