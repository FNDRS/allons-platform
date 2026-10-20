"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCountdown } from "@/hooks/useCountdown";
import { HoldCountdown } from "./HoldCountdown";

/**
 * The buyer is about to leave a checkout they started. Staying is the easy
 * answer (primary, and what closing the sheet does); leaving says plainly
 * what it costs, and the clock shows how long they still have.
 */
export function LeaveCheckoutModal({
  open,
  holdExpiresAt,
  hasInput,
  readingPolicy = null,
  onStay,
  onLeave,
}: {
  open: boolean;
  /** When the held entry is released; null when no paid entry is picked. */
  holdExpiresAt: string | null;
  /** Something was typed, so leaving also loses that. */
  hasInput: boolean;
  /** The policy page they tapped, when that is the exit: nothing is lost. */
  readingPolicy?: string | null;
  onStay: () => void;
  onLeave: () => void;
}) {
  // From the clock, not the prop: once it runs out the copy must not keep
  // promising a reserved entry for the second before the form leaves.
  const holdsTicket = useCountdown(open ? holdExpiresAt : null) !== null;
  const cost = readingPolicy
    ? holdsTicket
      ? `Vas a salir del checkout para leer ${readingPolicy}. Tu entrada sigue reservada mientras tanto y lo que llenaste se guarda: al volver, sigues donde estabas.`
      : `Vas a salir del checkout para leer ${readingPolicy}. Lo que llenaste se guarda: al volver, sigues donde estabas.`
    : holdsTicket && hasInput
      ? "Tu entrada está reservada y lo que llenaste sigue aquí. Si sales ahora, la entrada se libera y tendrás que empezar de nuevo."
      : holdsTicket
        ? "Tu entrada está reservada. Si sales ahora, se libera y tendrás que empezar de nuevo."
        : "Lo que llenaste sigue aquí. Si sales ahora, se pierde y tendrás que empezar de nuevo.";
  return (
    <Modal open={open} onClose={onStay} title="¿Salir del checkout?">
      <p className="text-[15px] leading-7 text-white/65">{cost}</p>
      {open && holdsTicket && holdExpiresAt ? (
        <div className="mt-4">
          <HoldCountdown expiresAt={holdExpiresAt} label="Tiempo para completar tu compra" />
        </div>
      ) : null}
      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" full onClick={onStay} autoFocus>
          Permanecer
        </Button>
        <Button size="lg" full variant="secondary" onClick={onLeave}>
          {readingPolicy ? "Ir a leerlo" : "Salir y perder el avance"}
        </Button>
      </div>
    </Modal>
  );
}
