import type { ClassScheduleDraft } from "@/hooks/class-program-form/useClassSessionTemplatesForm";
import { ClassBuilderSection } from "./ClassBuilderSection";
import { ClassDraftRow } from "./ClassDraftRow";
import { slotLabel } from "./classProgramFormat";

/** Weekly recurring slots (horarios) the program runs. */
export function ClassProgramScheduleBuilder({
  schedules,
  onAdd,
  onEdit,
  onRemove,
}: {
  schedules: ClassScheduleDraft[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <ClassBuilderSection
      title="Horarios recurrentes"
      intro="Agrega cada día y hora en que se imparte este programa."
      addLabel="Agregar horario"
      emptyHint="Agrega al menos un horario para poder publicar el programa."
      isEmpty={schedules.length === 0}
      onAdd={onAdd}
    >
      {schedules.map((schedule) => {
        const label = slotLabel(schedule.weekday, schedule.startTime);
        const detail = [
          schedule.instructorName.trim() || "Instructor del programa",
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
