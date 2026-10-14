import type { ClassScheduleDraft } from "@/hooks/class-program-form/useClassSessionTemplatesForm";
import type { ClassCoach } from "@/lib/api/classCoaches";
import { ClassBuilderSection } from "./ClassBuilderSection";
import { ClassDraftRow } from "./ClassDraftRow";
import { slotLabel, slotRangeLabel } from "./classProgramFormat";

function coachLabel(schedule: ClassScheduleDraft, coaches: ClassCoach[]): string {
  const coach = coaches.find((item) => item.id === schedule.coachId);
  return coach?.name ?? (schedule.legacyInstructor.trim() || "Coach del programa");
}

/** Slots (horarios) the program runs: weekly, within dates, or on one date. */
export function ClassProgramScheduleBuilder({
  schedules,
  coaches,
  onAdd,
  onEdit,
  onRemove,
}: {
  schedules: ClassScheduleDraft[];
  coaches: ClassCoach[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <ClassBuilderSection
      title="Horarios"
      intro="Agrega cada día y hora en que se imparte este programa. Puedes limitarlo a unas fechas, por ejemplo solo diciembre."
      addLabel="Agregar horario"
      emptyHint="Agrega al menos un horario para poder publicar el programa."
      isEmpty={schedules.length === 0}
      onAdd={onAdd}
    >
      {schedules.map((schedule) => {
        const label = slotLabel(schedule.weekday, schedule.startTime);
        const detail = [
          coachLabel(schedule, coaches),
          schedule.capacity ? `${schedule.capacity} cupos` : null,
          schedule.durationMinutes ? `${schedule.durationMinutes} min` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <ClassDraftRow
            key={schedule.id}
            title={label}
            detail={detail}
            note={
              schedule.dateMode === "weekly"
                ? null
                : slotRangeLabel(
                    schedule.startsOn,
                    schedule.dateMode === "once" ? schedule.startsOn : schedule.endsOn,
                  )
            }
            editLabel={`Editar horario ${label}`}
            removeLabel={`Quitar horario ${label}`}
            onEdit={() => onEdit(schedule.id)}
            onRemove={() => onRemove(schedule.id)}
          />
        );
      })}
    </ClassBuilderSection>
  );
}
