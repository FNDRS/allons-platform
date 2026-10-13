import { Clock, User } from "lucide-react";
import type { ClassProgram } from "@/lib/api/classPrograms";
import { classScheduleLabel } from "@/lib/classFormat";
import { CalendarMark, MetaTile, PinMark } from "@/components/ui/MetaTile";

function mapsUrl(program: ClassProgram): string | null {
  if (program.latitude != null && program.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${program.latitude},${program.longitude}`;
  }
  const query = [program.locationName, program.address, program.city].filter(Boolean).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

/** When it runs, where, who teaches it and how long it lasts. */
export function ClassProgramMeta({ program }: { program: ClassProgram }) {
  const schedule = classScheduleLabel(program.sessionTemplates);
  const place = [program.locationName ?? program.address, program.city]
    .filter(Boolean)
    .join(" · ");

  return (
    <ul className="flex flex-col gap-2">
      {schedule ? (
        <MetaTile icon={<CalendarMark />} label="Horario">
          {schedule}
        </MetaTile>
      ) : null}
      {place ? (
        <MetaTile icon={<PinMark />} label="Dónde" href={mapsUrl(program)}>
          {place}
        </MetaTile>
      ) : null}
      {program.instructorName ? (
        <MetaTile icon={<User className="size-[18px]" strokeWidth={1.6} />} label="Coach">
          {program.instructorName}
        </MetaTile>
      ) : null}
      {program.durationMinutes ? (
        <MetaTile icon={<Clock className="size-[18px]" strokeWidth={1.6} />} label="Duración">
          {program.durationMinutes} min
        </MetaTile>
      ) : null}
    </ul>
  );
}
