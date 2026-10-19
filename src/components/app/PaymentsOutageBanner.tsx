import { CircleAlert } from "lucide-react";
import { PAYMENTS_OUTAGE } from "@/lib/paymentsOutage";

/**
 * Site-wide notice while the payment gateway is down. It stays pinned on
 * scroll, so it is one line tall and sets `--outage-h` for the sticky
 * headers to sit under it.
 */
export function PaymentsOutageBanner() {
  if (!PAYMENTS_OUTAGE) return null;
  return (
    <>
      <style>{`:root{--outage-h:calc(36px + env(safe-area-inset-top))}`}</style>
      {/* Fixed, not sticky: body is only a viewport tall, so a sticky
          child of it lets go after the first screen. */}
      <div aria-hidden className="h-[var(--outage-h)]" />
      <div
        role="status"
        className="fixed inset-x-0 top-0 z-50 flex h-[var(--outage-h)] items-end border-b border-amber-400/30 bg-[#2a1c06] px-4 pt-[env(safe-area-inset-top)] text-[13px] text-white/85"
      >
        <p className="mx-auto flex h-9 min-w-0 max-w-[1200px] items-center justify-center gap-2">
          <CircleAlert className="size-4 shrink-0 text-amber-300" aria-hidden />
          <span className="truncate">
            <span className="font-semibold text-white">
              Estamos teniendo problemas con la plataforma de pagos.
            </span>
            <span className="hidden sm:inline">
              {" "}Pausamos los pagos mientras se resuelve.
            </span>
          </span>
        </p>
      </div>
    </>
  );
}
