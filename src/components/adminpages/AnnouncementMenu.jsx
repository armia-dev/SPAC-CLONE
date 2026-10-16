import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Pin, Eye, Pencil, Trash2 } from 'lucide-react';

const MENU_WIDTH = 160; // matches w-40
const MENU_HEIGHT = 156; // approximate height of the 4 items
const GAP = 6; // space between the kebab button and the menu
const EDGE = 8; // minimum distance from the screen edges

export default function AnnouncementMenu({
  isOpen = false,
  onClose,
  onPin,
  onView,
  onEdit,
  onDelete,
  announcement = null,
  isPinned = false,
  anchorRect = null, // { top, bottom, left, right } of the three-dots button
  align = 'right',
  className = '',
}) {
  const menuRef = useRef(null);

  // Compute fixed position directly from the button's rectangle
  const pos = useMemo(() => {
    if (!isOpen || !anchorRect) return null;

    // Open below the button; flip above if there isn't enough room
    let top = anchorRect.bottom + GAP;
    if (top + MENU_HEIGHT > window.innerHeight - EDGE) {
      top = Math.max(EDGE, anchorRect.top - MENU_HEIGHT - GAP);
    }

    // Right edge of the menu lines up with the right edge of the button
    let left = align === 'left' ? anchorRect.left : anchorRect.right - MENU_WIDTH;
    left = Math.min(
      Math.max(EDGE, left),
      window.innerWidth - MENU_WIDTH - EDGE
    );

    return { top, left };
  }, [isOpen, anchorRect, align]);

  // Close on scroll / resize so the menu never floats away from its button
  useEffect(() => {
    if (!isOpen) return;
    const handleMove = () => onClose?.();
    window.addEventListener('resize', handleMove);
    window.addEventListener('scroll', handleMove, true); // capture: also catches inner panel scroll
    return () => {
      window.removeEventListener('resize', handleMove);
      window.removeEventListener('scroll', handleMove, true);
    };
  }, [isOpen, onClose]);

  // Close on outside click / Escape
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

    // Delay slightly to prevent immediate closing from the opening click event
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pos) return null;

  const currentIsPinned = Boolean(isPinned ?? announcement?.isPinned ?? announcement?.pinned);

  const handleAction = (callback) => {
    if (callback) {
      callback(announcement);
    }
    onClose?.();
  };

  // Rendered in document.body so the panel's overflow can't clip it
  return createPortal(
    <div
      ref={menuRef}
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
        position: 'fixed',
        top: pos.top,
        left: pos.left,
      }}
      className={`w-40 bg-white border border-[#121212] rounded-xl shadow-lg p-1.5 z-[60] animate-in fade-in zoom-in-95 duration-100 origin-top-right text-left select-none ${className}`}
      role="menu"
      aria-orientation="vertical"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Pin / Unpin */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(onPin)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer text-left group"
      >
        <Pin
          className={`w-4 h-4 text-[#121212] group-hover:scale-105 transition-transform stroke-[1.9] ${
            currentIsPinned ? 'fill-[#121212]' : ''
          }`}
        />
        <span>{currentIsPinned ? 'Unpin' : 'Pin'}</span>
      </button>

      {/* 2. View */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(onView)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer text-left group"
      >
        <Eye className="w-4 h-4 text-[#121212] group-hover:scale-105 transition-transform stroke-[1.9]" />
        <span>View</span>
      </button>

      {/* 3. Edit */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(onEdit)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer text-left group"
      >
        <Pencil className="w-4 h-4 text-[#121212] group-hover:scale-105 transition-transform stroke-[1.9]" />
        <span>Edit</span>
      </button>

      {/* Separator line */}
      <div className="w-full h-px bg-neutral-200/80 my-1" />

      {/* 4. Delete */}
      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction(onDelete)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-colors cursor-pointer text-left group"
      >
        <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-105 transition-all stroke-[1.9]" />
        <span>Delete</span>
      </button>
    </div>,
    document.body
  );
}