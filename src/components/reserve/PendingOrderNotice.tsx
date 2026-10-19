"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { useCountdown } from "@/hooks/useCountdown";
import { payOrderHref, type ActivePaymentOrder } from "@/lib/api/payments";

/**
 * An open checkout of the buyer's own on this event. A payment form can be
 * resumed; a card charge waiting on 3DS cannot, so it says how long until a
 * new one is allowed and where to follow the bank's answer.
 */
export function PendingOrderNotice({
  order,
  eventId,
}: {
  order: ActivePaymentOrder;
  eventId: string;
}) {
  const countdown = useCountdown(order.expiresAt);
  const byCard = order.channel === "card";
  const href = byCard
    ? `/pagar/${encodeURIComponent(order.orderId)}?event=${encodeURIComponent(eventId)}&pago=tarjeta`
    : payOrderHref(order.orderId, eventId, order.paymentLink);

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-accent/30 bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-white">
          {byCard
            ? "Tu banco está confirmando un pago anterior"
            : "Tienes un pago pendiente para este evento"}
        </p>
        <p className="mt-1 text-[13px] leading-5 text-white/55">
          {byCard ? (
            <>
              Si lo aprueba, tu boleto aparece solo. Podrás intentar de nuevo{" "}
              {countdown ? (
                <>
                  en <span className="font-semibold tabular-nums text-white">{countdown}</span>.
                </>
              ) : (
                "en unos minutos."
              )}
            </>
          ) : (
            <>
              Termínalo para recibir tu boleto.{" "}
              {countdown ? (
                <>
                  Vence en <span className="font-semibold tabular-nums text-white">{countdown}</span>;
                  después puedes empezar otro.
                </>
              ) : (
                "Mientras siga abierto no puedes empezar otro."
              )}
            </>
          )}
        </p>
      </div>
      <Link
        href={href}
        className={buttonClass({ size: "sm", variant: byCard ? "secondary" : "primary" })}
      >
        {byCard ? "Ver estado" : "Continuar pago"}
      </Link>
    </div>
  );
}
