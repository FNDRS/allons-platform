"use client";

import Link from "next/link";
import { Button, buttonClass } from "@/components/ui/Button";
import { useCountdown } from "@/hooks/useCountdown";
import type { GuestPendingOrder } from "@/hooks/useReserveForm";

/**
 * A guest already has a checkout open on this event. From the browser that
 * started it, it can be finished or dropped for a new one; from another, it
 * can only be waited out, and the mail from the first attempt is the way in.
 */
export function GuestPendingOrderNotice({
  order,
  eventId,
  busy,
  onDrop,
}: {
  order: GuestPendingOrder;
  eventId: string;
  busy: boolean;
  onDrop: () => void;
}) {
  const countdown = useCountdown(order.expiresAt);
  const byCard = order.channel === "card";
  const resumable = Boolean(order.token);
  const href = `/pagar/${encodeURIComponent(order.orderId)}?event=${encodeURIComponent(eventId)}${
    byCard ? "&pago=tarjeta" : ""
  }`;

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-[20px] border border-accent/30 bg-accent/10 p-4"
    >
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-white">
          {byCard
            ? "Tu banco está confirmando un pago anterior"
            : "Ya tienes un pago abierto para este evento"}
        </p>
        <p className="mt-1 text-[14px] leading-6 text-white/60">
          {resumable
            ? byCard
              ? "Si lo aprueba, tu boleto llega a tu correo. Puedes ver cómo va, o esperar e intentar de nuevo."
              : "Puedes terminarlo donde lo dejaste, o cancelarlo y empezar este de nuevo."
            : countdown
              ? `Se inició con este correo desde otro lugar. Vence en ${countdown}; después puedes empezar otro.`
              : "Se inició con este correo desde otro lugar. En cuanto venza puedes empezar otro."}
        </p>
      </div>
      {resumable ? (
        <div className="flex flex-wrap gap-2">
          <Link href={href} className={buttonClass({ size: "md" })}>
            {byCard ? "Ver estado" : "Continuar pago"}
          </Link>
          {!byCard ? (
            <Button variant="secondary" size="md" loading={busy} onClick={onDrop}>
              Cancelar y empezar de nuevo
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
