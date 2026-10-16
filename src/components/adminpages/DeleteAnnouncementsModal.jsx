import React, { useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

/**
 * DeleteAnnouncementModal
 * Clean, simplified confirmation modal for deleting an announcement.
 *
 * Specifics:
 * - Only ONE line separator on top (under the header)
 * - No panel for title; title is bolded directly within the message copy
 * - Cancel button is styled in the classic grey (#d1d5db)
 * - Delete button has #C42B2B red styling
 */
export default function DeleteAnnouncementModal({
  isOpen = true,
  onClose,
  onDelete,
  announcement = null,
  isDeleting = false,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isDeleting) {
        onClose?.();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen) return null;

  const title = announcement?.title || 'this announcement';

  const handleConfirmDelete = () => {
    if (onDelete && announcement) {
      onDelete(announcement);
    }
    onClose?.();
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose?.();
        }
      }}
    >
      {/* Modal Container */}
      <div className="w-full max-w-[420px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col relative transition-all duration-150 space-y-3.5">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#121212] tracking-tight">
            Delete Announcement
          </h2>

          {/* Close (X) button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-full text-[#6b7280] hover:text-[#121212] hover:bg-[#fbfaf1] transition-colors cursor-pointer disabled:opacity-50"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Only ONE line separator on top */}
        <div className="w-full h-px bg-[#dedbc4]" />

        {/* Body Content: No panel; title bolded directly in message */}
        <div className="space-y-1.5 py-1">
          <p className="text-xs sm:text-[13px] text-[#4a4a42] leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-bold text-[#121212]">"{title}"</span>?
          </p>
          <p className="text-xs text-[#6b7280] leading-relaxed">
            This action cannot be undone and will permanently remove it from the staff portal.
          </p>
        </div>

        {/* Footer Actions: Cancel button in the classic grey (#d1d5db) */}
        <div className="w-full flex items-center justify-end gap-2.5 pt-1.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 sm:px-7 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="px-5 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#C42B2B] text-white hover:bg-[#a82222] active:scale-[0.98] transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
