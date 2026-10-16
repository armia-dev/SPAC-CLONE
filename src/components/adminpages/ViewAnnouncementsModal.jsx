import React, { useEffect } from 'react';
import { X, Pin, Pencil } from 'lucide-react';

export default function ViewAnnouncementModal({
  isOpen = true,
  onClose,
  announcement = null,
  onEdit = null,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !announcement) return null;

  const isPinned = Boolean(announcement.isPinned ?? announcement.pinned);
  const title = announcement.title || 'Announcement Details';
  const message = announcement.message || announcement.description || '';
  const timestamp =
    announcement.postedText ||
    (announcement.createdAt
      ? new Date(announcement.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Recently posted');

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      {/* Modal Container */}
      <div className="w-full max-w-[440px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col relative transition-all duration-150 space-y-3.5">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#121212] tracking-tight">
            View Announcement
          </h2>

          {/* Close (X) button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#6b7280] hover:text-[#121212] hover:bg-[#fbfaf1] transition-colors cursor-pointer"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Only ONE line separator on top */}
        <div className="w-full h-px bg-[#dedbc4]" />

        {/* Body Content (No inner panel, direct on white) */}
        <div className="space-y-2 py-1">
          {/* Timestamp (with the same simple pin icon as the dashboard when pinned) */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
            {isPinned && (
              <Pin className="w-3 h-3 fill-[#121212] text-[#121212]" />
            )}
            <span>{timestamp}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-[#121212] tracking-tight leading-snug pt-0.5">
            {title}
          </h3>

          {/* Message Text */}
          <p className="text-xs sm:text-[13px] text-[#4a4a42] leading-relaxed whitespace-pre-wrap">
            {message}
          </p>

          {/* Staff Info Note */}
          <p className="text-[11px] text-[#9ca3af] pt-1">
            Visible to Court Staff on their portal.
          </p>
        </div>

        {/* Footer Actions: Close on the left in classic grey (#d1d5db); Edit on the right */}
        <div className="w-full flex items-center justify-between pt-1.5">
          <button
            type="button"
            onClick={onClose}
            className="px-6 sm:px-7 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer"
          >
            Close
          </button>

          {onEdit ? (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onEdit(announcement);
              }}
              className="px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-[#121212] bg-[#ffffff] border border-[#121212] hover:bg-[#fbfaf1] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Pencil className="w-3.5 h-3.5 text-[#121212] stroke-[2]" />
              <span>Edit</span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}