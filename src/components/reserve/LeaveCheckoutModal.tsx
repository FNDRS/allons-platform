"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCountdown } from "@/hooks/useCountdown";

/**
 * The buyer is about to leave a checkout they started. Staying is the easy
 * answer (primary, and what closing the sheet does); leaving says plainly
 * what it costs, and the clock says there is no hurry to decide.
 */
export function LeaveCheckoutModal({
  open,
  holdExpiresAt,
  hasInput,
  onStay,
  onLeave,
}: {
  open: boolean;
  /** When the held entry is released; null when no paid entry is picked. */
  holdExpiresAt: string | null;
  /** Something was typed, so leaving also loses that. */
  hasInput: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const countdown = useCountdown(open ? holdExpiresAt : null);
  const holdsTicket = Boolean(holdExpiresAt);
  const cost =
    holdsTicket && hasInput
      ? "Tu entrada está reservada y lo que llenaste sigue aquí. Si sales ahora, la entrada se libera y tendrás que empezar de nuevo."
      : holdsTicket
        ? "Tu entrada está reservada. Si sales ahora, se libera y tendrás que empezar de nuevo."
        : "Lo que llenaste sigue aquí. Si sales ahora, se pierde y tendrás que empezar de nuevo.";
  return (
    <Modal open={open} onClose={onStay} title="¿Salir del checkout?">
      <p className="text-[15px] leading-7 text-white/65">{cost}</p>
      {countdown ? (
        <p
          role="timer"
          aria-live="polite"
          className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[13px] text-white/55"
        >
          <span>Tiempo para completar tu compra</span>
          <span className="text-[16px] font-bold tabular-nums tracking-tight text-white">
            {countdown}
          </span>
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" full onClick={onStay} autoFocus>
          Permanecer
        </Button>
        <Button size="lg" full variant="secondary" onClick={onLeave}>
          Salir y perder el avance
        </Button>
      </div>
    </Modal>
  );
}
