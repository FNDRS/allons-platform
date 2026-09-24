"use client";

import { ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

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

function openPaygate(src: string) {
  return window.open(src, "_blank", "noopener");
}

/**
 * Paygate (Clinpays) blocks iframes (`X-Frame-Options` / `frame-ancestors`),
 * so checkout opens in a tab. This sheet stays on Allons and waits.
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
  const [blocked, setBlocked] = useState(false);
  const launched = useRef(false);

  useEffect(() => {
    if (!open) {
      launched.current = false;
      return;
    }
    if (launched.current) return;
    launched.current = true;
    const win = openPaygate(src);
    setBlocked(!win);
  }, [open, src]);

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
        className="modal-card flex w-full flex-col rounded-t-[24px] border border-white/10 bg-[#0c0c0e] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 sm:max-w-md sm:rounded-[24px] sm:pb-6 sm:pt-5"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden />
        <div className="flex items-center gap-3 pt-3 sm:pt-0">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              Pago
            </p>
            {amountLabel ? (
              <p className="truncate text-[20px] font-bold tracking-tight">{amountLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/60 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" strokeWidth={1.6} aria-hidden />
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <Loader2 className="size-6 animate-spin text-accent" aria-hidden />
          <p className="mt-5 text-[15px] font-semibold tracking-tight" role="status">
            {blocked
              ? "El navegador bloqueó la ventana de pago"
              : "Paygate se abrió en otra pestaña"}
          </p>
          <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-white/50">
            Paga ahí. Esta pestaña se actualiza sola cuando el cargo entre.
          </p>
        </div>

        <Button
          size="lg"
          full
          className="mt-8"
          onClick={() => {
            const win = openPaygate(src);
            setBlocked(!win);
          }}
        >
          Abrir Paygate
          <ExternalLink className="size-4" strokeWidth={1.6} aria-hidden />
        </Button>
      </div>
    </div>,
    document.body,
  );
}
