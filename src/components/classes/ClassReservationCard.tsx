import { QrCode } from "lucide-react";
import type { MyClassReservation } from "@/lib/api/classPrograms";
import { formatClassDate, formatClassTime } from "@/lib/classFormat";

/** An upcoming booking; opening it shows the QR and the cancel option. */
export function ClassReservationCard({
  reservation,
  onOpen,
}: {
  reservation: MyClassReservation;
  onOpen: () => void;
}) {
  const place = [reservation.locationName, reservation.city].filter(Boolean).join(" · ");
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full min-w-0 items-center gap-4 rounded-[22px] border border-white/[0.08] bg-[#0c0c0e] px-5 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
    >
      <span className="w-24 shrink-0">
        <span className="block text-[13px] font-semibold text-white/60">
          {formatClassDate(reservation.date)}
        </span>
        <span className="block text-[16px] font-bold tabular-nums tracking-tight">
          {formatClassTime(reservation.startTime)}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold tracking-tight">
          {reservation.programTitle}
        </span>
        <span className="block truncate text-[13px] text-white/50">
          {[reservation.providerName, place].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-white/75 ring-1 ring-white/10">
        <QrCode className="size-[18px]" strokeWidth={1.6} aria-label="Ver QR" />
      </span>
    </button>
  );
}
