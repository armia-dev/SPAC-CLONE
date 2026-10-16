import React, { useEffect, useRef } from 'react';
import { Eye, CalendarClock, Ban } from 'lucide-react';

/**
 * BookingsTblMenu
 * Small kebab dropdown modal shown when clicking the three dots action button in Bookings table.
 * Available actions depend on the booking status:
 *  - Reserved:  View, Reschedule, Cancel
 *  - Cancelled: View, Reschedule
 *  - Completed: View only
 */
export default function BookingsTblMenu({
  isOpen,
  onClose,
  booking,
  onView,
  onReschedule,
  onCancel,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose?.();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Which actions are allowed for this booking's status
  const status = booking?.status;
  const canReschedule = status === 'Reserved' || status === 'Cancelled';
  const canCancel = status === 'Reserved';

  return (
    <div
      ref={menuRef}
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-[#121212] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right text-left"
      role="menu"
      aria-orientation="vertical"
    >
      {/* View action (always available) */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onView?.(booking);
          onClose?.();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer group"
      >
        <Eye className="w-4 h-4 text-[#121212] group-hover:scale-105 transition-transform stroke-[1.9]" />
        <span>View</span>
      </button>

      {/* Reschedule action (Reserved & Cancelled) */}
      {canReschedule && (
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onReschedule?.(booking);
            onClose?.();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer group"
        >
          <CalendarClock className="w-4 h-4 text-[#121212] group-hover:scale-105 transition-transform stroke-[1.9]" />
          <span>Reschedule</span>
        </button>
      )}

      {/* Cancel action (Reserved only), with separator */}
      {canCancel && (
        <>
          <div className="w-full h-px bg-neutral-200/80 my-1" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onCancel?.(booking);
              onClose?.();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-colors cursor-pointer group"
          >
            <Ban className="w-4 h-4 text-red-600 group-hover:scale-105 transition-all stroke-[1.9]" />
            <span>Cancel</span>
          </button>
        </>
      )}
    </div>
  );
}