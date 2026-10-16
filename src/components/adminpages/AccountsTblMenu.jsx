import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Pencil } from 'lucide-react';

const MENU_WIDTH = 160; // w-40
const MENU_HEIGHT = 92; // approx height, used to decide whether to flip upward

/**
 * AccountsTblMenu
 * Small kebab dropdown shown when clicking the three dots action button in Accounts table.
 * Matches BookingsTblMenu styling:
 * - Container: w-40 bg-white border border-[#121212] rounded-xl shadow-lg p-1.5
 * - Buttons: View & Edit with matching hover, sizing, and stroke styling
 *
 * Rendered in a portal with fixed positioning so it is never clipped by the
 * table's overflow container (no extra padding/white space needed).
 *
 * Props:
 * - anchorRect: the DOMRect of the trigger button (from getBoundingClientRect)
 *
 * NOTE: The trigger button must have the attribute `data-menu-trigger`
 * so outside-click handling doesn't fight with the button's own toggle.
 */
export default function AccountsTblMenu({
  isOpen,
  onClose,
  account,
  anchorRect,
  onView,
  onEdit,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      // Let the trigger button handle its own toggle
      if (event.target.closest && event.target.closest('[data-menu-trigger]')) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose?.();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    // Fixed-position menu would drift from its button on scroll/resize, so close it
    function handleScrollOrResize() {
      onClose?.();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) return null;

  // Align the menu's right edge with the button's right edge
  const right = Math.max(8, window.innerWidth - anchorRect.right);

  // Flip above the button if there isn't enough room below
  const openUpward = anchorRect.bottom + MENU_HEIGHT + 12 > window.innerHeight;
  const positionStyle = openUpward
    ? { bottom: window.innerHeight - anchorRect.top + 6, right }
    : { top: anchorRect.bottom + 6, right };

  return createPortal(
    <div
      ref={menuRef}
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
        position: 'fixed',
        width: MENU_WIDTH,
        ...positionStyle,
      }}
      className={`bg-white border border-[#121212] rounded-xl shadow-lg p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100 text-left ${
        openUpward ? 'origin-bottom-right' : 'origin-top-right'
      }`}
      role="menu"
      aria-orientation="vertical"
    >
      {/* View action */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onView?.(account);
          onClose?.();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer group"
      >
        <Eye className="w-4 h-4 text-[#121212] group-hover:scale-105 transition-transform stroke-[1.9]" />
        <span>View</span>
      </button>

      {/* Edit action */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onEdit?.(account);
          onClose?.();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer group"
      >
        <Pencil className="w-4 h-4 text-[#121212] group-hover:scale-105 transition-transform stroke-[1.9]" />
        <span>Edit</span>
      </button>
    </div>,
    document.body
  );
}