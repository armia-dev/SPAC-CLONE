"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

/**
 * Asks the admin to confirm before resetting settings.
 *
 * Props:
 *  - isOpen       boolean
 *  - onClose      () => void   (Cancel, backdrop click, Escape, X)
 *  - onConfirm    () => void   (runs the actual reset; popup closes itself afterwards)
 *  - sectionName  string       (e.g. "pricing" -> "Unsaved changes to pricing will be lost…")
 */
export default function PopupSettingsResetConfirmation({
  isOpen,
  onClose,
  onConfirm,
  sectionName = "these settings",
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // Focus the safe option first so Enter can't reset by accident
    cancelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Rendered into <body> so the overlay always covers the whole viewport,
  // even if a parent has transform/overflow that would trap `fixed`.
  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reset-confirm-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        className="relative w-full max-w-sm rounded-2xl border border-[#121212] bg-[#ffffff] p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[#121212] bg-[#ffffff] text-[#121212] hover:bg-neutral-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#121212] bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={2} />
        </div>

        <h3 id="reset-confirm-title" className="mt-3 text-sm font-bold text-[#121212]">
          Reset to defaults?
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#5f5e5e]">
          Changes to <span className="font-semibold text-[#121212]">{sectionName}</span> will be
          discarded and the original values restored. This can't be undone.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-[#121212] bg-[#ffffff] px-4 py-1.5 text-xs font-semibold text-[#121212] hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className="cursor-pointer rounded-xl border border-[#121212] bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
          >
            Yes, reset
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}