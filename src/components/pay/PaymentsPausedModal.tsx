"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

function subscribeNoop() {
  return () => {};
}

function useBrowser() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/**
 * Blocks paid checkout while payments are paused. Dismissible so the
 * buyer can still read the event; the pay action will not run.
 */
export function PaymentsPausedModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
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
      className="modal-overlay fixed inset-0 z-[80] flex items-end justify-center bg-black/75 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payments-paused-title"
        onClick={(event) => event.stopPropagation()}
        className="modal-card relative w-full overflow-hidden rounded-t-[28px] border border-white/10 bg-[#0c0c0e] px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 shadow-[0_40px_90px_rgba(0,0,0,0.55)] sm:max-w-[420px] sm:rounded-[28px] sm:px-8 sm:pb-8 sm:pt-8"
      >
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="mx-auto mb-7 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden />

        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          En curso
        </p>
        <h2
          id="payments-paused-title"
          className="mt-4 text-[30px] font-bold leading-[1.02] tracking-[-0.045em] sm:text-[34px]"
        >
          Estamos trabajando en los pagos
        </h2>
        <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-white/50">
          El cobro en la web está en pausa mientras lo dejamos listo. No se hará ningún cargo. Las entradas gratis siguen disponibles.
        </p>

        <Button size="lg" full variant="secondary" className="mt-8" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </div>,
    document.body,
  );
}
