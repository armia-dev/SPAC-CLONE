import React, { useEffect } from 'react';
import { X, LogOut } from 'lucide-react';

/**
 * LogoutConfirmation
 * A clean, cohesive confirmation modal for logging out of the admin panel.
 * 
 * Guide Specs:
 * - "Are you sure you want to log out?" (text color: #121212)
 * - "You'll need to log in again to access your account" (subtext)
 * - Horizontal separator line: #dedbc4
 * - Buttons:
 *   - Left: Cancel (bg: #d1d5db, text: #121212, rounded-full)
 *   - Right: icon + text Logout (rounded-full)
 */
export default function LogoutConfirmation({
  isOpen = true,
  onClose,
  onCancel,
  onConfirm,
  onLogout,
  title = 'Are you sure you want to log out?',
  subtext = "You'll need to log in again to access your account",
}) {
  const handleDismiss = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        handleDismiss();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
    >
      {/* Modal Container */}
      <div className="w-full max-w-[420px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col relative transition-all duration-150">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 pr-1">
            <h2 className="text-base sm:text-lg font-bold text-[#121212] tracking-tight leading-snug">
              {title}
            </h2>
            <p className="text-xs sm:text-[13px] text-[#6b7280] font-normal mt-1 leading-relaxed">
              {subtext}
            </p>
          </div>

          {/* Close (X) button: #6b7280 */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full text-[#6b7280] hover:text-[#121212] transition-colors cursor-pointer shrink-0 mt-0.5"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Horizontal Separator Line: #dedbc4 */}
        <div className="w-full h-px bg-[#dedbc4] my-3.5 sm:my-4" />

        {/* Action Buttons: left (Cancel), right (icon + text Logout) */}
        <div className="w-full flex items-center justify-between gap-3 pt-0.5">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer"
          >
            Cancel
          </button>

          {/* Logout button (icon + text): #C42B2B */}
          <button
            type="button"
            onClick={handleLogoutAction}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#C42B2B] text-white hover:bg-[#a82424] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
