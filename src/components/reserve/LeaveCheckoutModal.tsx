"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

/**
 * The buyer is about to leave a checkout they started. Staying is the easy
 * answer (primary, and what closing the sheet does); leaving says plainly
 * what it costs.
 */
export function LeaveCheckoutModal({
  open,
  holdsTicket,
  hasInput,
  onStay,
  onLeave,
}: {
  open: boolean;
  /** A paid entry is picked, so leaving also gives up its place. */
  holdsTicket: boolean;
  /** Something was typed, so leaving also loses that. */
  hasInput: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const cost =
    holdsTicket && hasInput
      ? "Si sales, tu entrada se libera y pierdes lo que llevas llenado."
      : holdsTicket
        ? "Si sales, tu entrada se libera."
        : "Si sales, pierdes lo que llevas llenado.";
  return (
    <Modal open={open} onClose={onStay} title="¿Salir del checkout?">
      <p className="text-[15px] leading-7 text-white/65">{cost}</p>
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
