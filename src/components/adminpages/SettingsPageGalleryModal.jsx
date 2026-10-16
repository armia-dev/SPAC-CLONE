"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, X } from "lucide-react";

const LIME = "#ccff00";
const ITEMS_PER_PAGE = 10; // 2 rows of 5 on large screens

/**
 * Gallery popup for the Business settings tab.
 *
 * Props:
 *  - isOpen:    boolean
 *  - images:    [{ id, src }]
 *  - onClose:   () => void
 *  - onAdd:     (files: File[]) => void       // "Add Image" / dashed tile
 *  - onReplace: (id, file: File) => void      // refresh icon on a tile
 *  - onRemove:  (id) => void                  // X icon on a tile
 */
export default function SettingsPageGalleryModal({
  isOpen,
  images = [],
  onClose,
  onAdd,
  onReplace,
  onRemove,
}) {
  const addInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const replaceTargetRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(images.length / ITEMS_PER_PAGE));

  // Always start on the first page when the popup opens
  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen]);

  // Keep the page valid after removing photos
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Close on Escape + lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageImages = images.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  // Show the dashed "add" tile on the last page, if there's room
  const showAddTile = currentPage === totalPages && pageImages.length < ITEMS_PER_PAGE;

  const handleAddChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onAdd?.(files);
    e.target.value = "";
  };

  const handleReplaceChange = (e) => {
    const file = e.target.files?.[0];
    if (file && replaceTargetRef.current != null) {
      onReplace?.(replaceTargetRef.current, file);
    }
    replaceTargetRef.current = null;
    e.target.value = "";
  };

  const startReplace = (id) => {
    replaceTargetRef.current = id;
    replaceInputRef.current?.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        // close only when the backdrop itself is clicked
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-modal-title"
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#121212] bg-[#ffffff] shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c4c9ac] px-5 py-4 sm:px-6">
          <h2
            id="gallery-modal-title"
            className="text-base font-bold text-[#121212] sm:text-lg"
          >
            Gallery photos
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#121212] transition-colors hover:bg-neutral-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {pageImages.map((img, i) => {
              const index = startIndex + i;
              return (
              <div
                key={img.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#121212] bg-neutral-100"
              >
                {img.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.src}
                    alt={`Gallery photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-[#6b7280]">
                    No image
                  </div>
                )}

                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => startReplace(img.id)}
                    aria-label={`Replace photo ${index + 1}`}
                    className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#121212] bg-[#ffffff] text-[#121212] transition-colors hover:bg-neutral-100 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove?.(img.id)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#121212] bg-[#ffffff] text-[#121212] transition-colors hover:bg-neutral-100 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              );
            })}

            {/* Dashed "add" tile */}
            {showAddTile && (
            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              aria-label="Add image"
              className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-[#121212]/40 text-xs font-medium text-[#5f5e5e] transition-colors hover:bg-neutral-100 cursor-pointer"
            >
              + Add
            </button>
            )}
          </div>

          {images.length === 0 && (
            <p className="mt-4 text-center text-xs text-[#5f5e5e]">
              No gallery photos yet. Add an image to get started.
            </p>
          )}
        </div>

        {/* Pagination */}
        {images.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-2.5 border-t border-[#c4c9ac] px-5 py-2.5 text-xs text-[#5f5e5e] sm:flex-row sm:px-6">
            <div>
              Showing{" "}
              <span className="font-bold text-[#121212]">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-[#121212]">
                {Math.min(startIndex + ITEMS_PER_PAGE, images.length)}
              </span>{" "}
              of <span className="font-bold text-[#121212]">{images.length}</span> photos
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`rounded-md border border-[#121212] p-1 transition-colors ${
                  currentPage <= 1
                    ? "cursor-not-allowed border-neutral-300 text-neutral-400 opacity-30"
                    : "cursor-pointer text-[#121212] hover:bg-neutral-100"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5 stroke-[2]" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex h-7 min-w-[28px] cursor-pointer items-center justify-center rounded-md px-1 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#121212] font-bold text-[#ccff00]"
                        : "border border-[#121212]/30 text-[#121212] hover:bg-neutral-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`rounded-md border border-[#121212] p-1 transition-colors ${
                  currentPage >= totalPages
                    ? "cursor-not-allowed border-neutral-300 text-neutral-400 opacity-30"
                    : "cursor-pointer text-[#121212] hover:bg-neutral-100"
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#c4c9ac] px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#121212] bg-[#ffffff] px-6 h-[34px] sm:h-[36px] text-xs font-semibold text-[#121212] transition-colors hover:bg-neutral-100 cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => addInputRef.current?.click()}
            style={{ backgroundColor: LIME }}
            className="rounded-xl border border-[#121212] px-6 h-[34px] sm:h-[36px] text-xs font-bold text-[#121212] transition hover:brightness-95 cursor-pointer"
          >
            Add image
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={addInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddChange}
        />
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleReplaceChange}
        />
      </div>
    </div>
  );
}