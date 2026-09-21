"use client";

import { ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
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
 * Hosted Clinpays checkout in this window. Card data never touches Allons;
 * the iframe is Paygate's page. Close hides it; the order keeps polling.
 */
export function PaygateModal({
  open,
  onClose,
  src,
  amountLabel,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  amountLabel?: string;
}) {
  const browser = useBrowser();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

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
      className="modal-overlay fixed inset-0 z-[80] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pago"
        className="modal-card flex h-[94dvh] w-full flex-col rounded-t-[24px] border border-white/10 bg-[#0c0c0e] pb-[env(safe-area-inset-bottom)] sm:h-[min(88dvh,760px)] sm:max-w-lg sm:rounded-[24px] sm:pb-0"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden />
        <div className="flex items-center gap-3 px-4 pt-3 pb-3 sm:px-5 sm:pt-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              Pago
            </p>
            {amountLabel ? (
              <p className="truncate text-[17px] font-bold tracking-tight">{amountLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/60 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" strokeWidth={1.6} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
          {!loaded ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0c0c0e]">
              <Loader2 className="size-6 animate-spin text-accent" aria-hidden />
            </div>
          ) : null}
          <iframe
            key={src}
            src={src}
            title="Pago seguro con Paygate"
            allow="payment"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0 bg-white"
            onLoad={() => setLoaded(true)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <p className="min-w-0 text-[12px] leading-snug text-white/40">
            Si el banco pide una verificación, puede abrir otra ventana corta.
          </p>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold tracking-tight text-white/55 transition hover:text-white"
          >
            Abrir aparte
            <ExternalLink className="size-3.5" strokeWidth={1.6} aria-hidden />
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
