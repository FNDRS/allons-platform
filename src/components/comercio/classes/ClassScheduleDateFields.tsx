import { DateField } from "@/components/ui/DateField";
import { Segmented } from "@/components/ui/Segmented";
import type {
  ClassScheduleDateMode,
  ClassScheduleDraft,
} from "@/hooks/class-program-form/useClassSessionTemplatesForm";
import { todayHN } from "@/lib/dateKeys";
import { ClassFormField } from "./ClassFormField";

const MODES: { value: ClassScheduleDateMode; label: string }[] = [
  { value: "weekly", label: "Cada semana" },
  { value: "range", label: "Entre fechas" },
  { value: "once", label: "Una fecha" },
];

const MODE_HINTS: Record<ClassScheduleDateMode, string> = {
  weekly: "Se repite todas las semanas, sin fecha final.",
  range: "Se repite cada semana solo dentro de esas fechas. Deja una vacía si no tiene inicio o fin.",
  once: "Una sola clase en esa fecha.",
};

/** Whether a slot runs every week, between two dates, or on a single date. */
export function ClassScheduleDateFields({
  draft,
  onChange,
}: {
  draft: ClassScheduleDraft;
  onChange: (patch: Partial<ClassScheduleDraft>) => void;
}) {
  const today = todayHN();
  return (
    <>
      <ClassFormField label="Cuándo" hint={MODE_HINTS[draft.dateMode]}>
        <Segmented
          label="Cuándo se imparte"
          value={draft.dateMode}
          options={MODES}
          onChange={(dateMode) => onChange({ dateMode })}
        />
      </ClassFormField>
      {draft.dateMode === "once" ? (
        <ClassFormField label="Fecha">
          {(id) => (
            <DateField
              id={id}
              value={draft.startsOn}
              min={today}
              onChange={(startsOn) => onChange({ startsOn })}
            />
          )}
        </ClassFormField>
      ) : null}
      {draft.dateMode === "range" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <ClassFormField label="Desde">
            {(id) => (
              <DateField
                id={id}
                value={draft.startsOn}
                min={today}
                placeholder="Sin inicio"
                onChange={(startsOn) => onChange({ startsOn })}
              />
            )}
          </ClassFormField>
          <ClassFormField label="Hasta">
            {(id) => (
              <DateField
                id={id}
                value={draft.endsOn}
                min={draft.startsOn || today}
                placeholder="Sin fin"
                onChange={(endsOn) => onChange({ endsOn })}
              />
            )}
          </ClassFormField>
        </div>
      ) : null}
    </>
  );
}
