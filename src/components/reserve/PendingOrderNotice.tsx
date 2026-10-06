import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { payOrderHref, type ActivePaymentOrder } from "@/lib/api/payments";

/** An open checkout of the buyer's own on this event, with a way back to it. */
export function PendingOrderNotice({
  order,
  eventId,
}: {
  order: ActivePaymentOrder;
  eventId: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-accent/30 bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-white">
          Tienes un pago pendiente para este evento
        </p>
        <p className="mt-1 text-[13px] leading-5 text-white/55">
          Termínalo para recibir tu boleto. Mientras siga abierto no puedes empezar otro.
        </p>
      </div>
      <Link
        href={payOrderHref(order.orderId, eventId, order.paymentLink)}
        className={buttonClass({ size: "sm" })}
      >
        Continuar pago
      </Link>
    </div>
  );
}
