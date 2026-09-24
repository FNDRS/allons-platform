"use client";

import { X } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

function subscribeNoop() {
  return () => {};
}

function useBrowser() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

/**
 * Bottom sheet on phones (with a drag handle), centered dialog on wider
 * screens. Always portaled to document.body so a parent with
 * backdrop-filter (the glass header) cannot trap position:fixed.
 * Closes on backdrop click and Escape.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const browser = useBrowser();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || !browser) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="modal-card flex max-h-[92dvh] w-full flex-col rounded-t-[24px] border border-border-strong bg-[#0c0c0e] pb-[env(safe-area-inset-bottom)] sm:max-w-lg sm:rounded-[24px] sm:pb-0"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden />
        <div className="flex items-center justify-between px-5 pt-4 pb-3 sm:pt-5">
          <h2 className="text-[19px] font-bold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-10 items-center justify-center rounded-full bg-surface-2 text-muted hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer ? <div className="border-t border-border px-5 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
