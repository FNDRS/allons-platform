import { Progress } from "@/components/ui/Stat";
import type { ClassCoach } from "@/lib/api/classCoaches";
import type { ClassScheduleSession } from "@/lib/api/classSchedule";
import { formatClassTime } from "@/lib/classFormat";
import { ClassCoachSelect } from "../ClassCoachSelect";
import { slotRangeLabel } from "../classProgramFormat";

/** One session of the week: program, time, how full it is and its coach. */
export function ClassScheduleSessionRow({
  session,
  coaches,
  swapping,
  onSwapCoach,
}: {
  session: ClassScheduleSession;
  coaches: ClassCoach[];
  swapping: boolean;
  onSwapCoach: (coachId: string) => void;
}) {
  const range = slotRangeLabel(session.startsOn, session.endsOn);
  return (
    <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden
          className="mt-1.5 size-2.5 shrink-0 rounded-full bg-accent"
          style={session.themeColor ? { backgroundColor: session.themeColor } : undefined}
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight">{session.programTitle}</p>
          <p className="text-[13px] tabular-nums text-white/55">
            {`${formatClassTime(session.startTime)} · ${session.durationMinutes} min`}
            {session.programStatus === "published" ? "" : " · Programa sin publicar"}
          </p>
          {range ? <p className="text-[12px] font-semibold text-accent">{range}</p> : null}
        </div>
      </div>
      <div className="w-full md:w-[140px]">
        <p className="mb-1.5 text-[12px] tabular-nums text-white/55">
          {`${session.reservedCount} de ${session.capacity} reservados`}
        </p>
        <Progress value={session.reservedCount} max={session.capacity} />
      </div>
      <div className="w-full md:w-[220px]">
        <ClassCoachSelect
          coaches={coaches}
          value={session.coachId ?? ""}
          onChange={onSwapCoach}
          noneLabel={session.instructorName ?? "Sin coach"}
          disabled={swapping}
          aria-label={`Coach de ${session.programTitle} a las ${formatClassTime(session.startTime)}`}
        />
      </div>
    </div>
  );
}
