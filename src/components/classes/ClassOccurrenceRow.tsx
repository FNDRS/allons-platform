import type { ClassOccurrence } from "@/lib/api/classPrograms";
import { formatClassTime, isOccurrenceElapsed } from "@/lib/classFormat";
import { Button } from "@/components/ui/Button";

/** Why a slot cannot be booked, or null when it can. */
function blockedReason(
  occurrence: ClassOccurrence,
  signedIn: boolean,
  hasSessions: boolean,
): string | null {
  if (occurrence.alreadyReserved) return "Ya reservaste";
  if (isOccurrenceElapsed(occurrence)) return "Ya pasó";
  if (!occurrence.canReserve || occurrence.availableSpots <= 0) return "Sin cupos";
  // A guest can still tap: it takes them to log in.
  if (signedIn && !hasSessions) return "Sin sesiones";
  return null;
}

/** One session: time, coach, spots left and the booking button. */
export function ClassOccurrenceRow({
  occurrence,
  signedIn,
  hasSessions,
  reserving,
  onReserve,
}: {
  occurrence: ClassOccurrence;
  signedIn: boolean;
  hasSessions: boolean;
  reserving: boolean;
  onReserve: () => void;
}) {
  const reason = blockedReason(occurrence, signedIn, hasSessions);
  return (
    <li className="flex min-w-0 items-center gap-4 rounded-[22px] border border-white/[0.08] bg-[#0c0c0e] px-5 py-4">
      <span className="w-20 shrink-0">
        <span className="block text-[16px] font-bold tabular-nums tracking-tight">
          {formatClassTime(occurrence.startTime)}
        </span>
        <span className="block text-[12px] text-white/45">{occurrence.durationMinutes} min</span>
      </span>
      <span className="min-w-0 flex-1">
        {occurrence.instructorName ? (
          <span className="block truncate text-[14px] font-medium text-white/85">
            {occurrence.instructorName}
          </span>
        ) : null}
        <span className="block text-[12px] text-white/45">
          {occurrence.availableSpots}/{occurrence.capacity} cupos disponibles
        </span>
      </span>
      <Button
        size="sm"
        variant={reason ? "secondary" : "primary"}
        disabled={Boolean(reason) || reserving}
        loading={reserving}
        onClick={onReserve}
      >
        {reason ?? "Reservar"}
      </Button>
    </li>
  );
}
