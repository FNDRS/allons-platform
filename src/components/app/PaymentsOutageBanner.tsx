import { CircleAlert } from "lucide-react";
import { PAYMENTS_OUTAGE } from "@/lib/paymentsOutage";

/** Site-wide notice while the payment gateway is down. */
export function PaymentsOutageBanner() {
  if (!PAYMENTS_OUTAGE) return null;
  return (
    <div
      role="status"
      className="relative z-50 border-b border-amber-400/30 bg-amber-500/15 px-4 pb-2.5 pt-[max(env(safe-area-inset-top),10px)] text-[13px] text-white/85"
    >
      <p className="mx-auto flex max-w-[1200px] items-start justify-center gap-2 text-center">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
        <span>
          <span className="font-semibold text-white">
            Estamos teniendo problemas con la plataforma de pagos.
          </span>{" "}
          Pausamos los pagos mientras se resuelve. Si ya intentaste pagar, revisa
          tus boletos antes de volver a intentar.
        </span>
      </p>
    </div>
  );
}
