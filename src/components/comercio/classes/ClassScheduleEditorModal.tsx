import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Chip } from "@/components/ui/Pill";
import { TimePicker } from "@/components/ui/TimePicker";
import type { ClassCoach } from "@/lib/api/classCoaches";
import { WEEKDAY_LABELS, WEEKDAY_OPTIONS } from "@/hooks/class-program-form/constants";
import type { ClassScheduleDraft } from "@/hooks/class-program-form/useClassSessionTemplatesForm";
import { ClassCoachSelect } from "./ClassCoachSelect";
import { ClassFormField } from "./ClassFormField";
import { ClassScheduleDateFields } from "./ClassScheduleDateFields";

const digits = (value: string) => value.replace(/\D/g, "");

/** Authors one slot: when it runs, the time, the coach and optional overrides. */
export function ClassScheduleEditorModal({
  draft,
  error,
  coaches,
  onChange,
  onCancel,
  onConfirm,
}: {
  draft: ClassScheduleDraft | null;
  error: string | null;
  coaches: ClassCoach[];
  onChange: (patch: Partial<ClassScheduleDraft>) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={Boolean(draft)}
      onClose={onCancel}
      title="Horario"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" disabled={Boolean(error)} onClick={onConfirm}>
            Guardar horario
          </Button>
        </div>
      }
    >
      {draft ? (
        <div className="flex flex-col gap-4">
          <ClassScheduleDateFields draft={draft} onChange={onChange} />
          {draft.dateMode === "once" ? null : (
            <ClassFormField label="Día">
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_OPTIONS.map((day) => (
                  <Chip
                    key={day.key}
                    active={draft.weekday === day.key}
                    onClick={() => onChange({ weekday: day.key })}
                  >
                    <span aria-hidden>{day.label}</span>
                    <span className="sr-only">{WEEKDAY_LABELS[day.key]}</span>
                  </Chip>
                ))}
              </div>
            </ClassFormField>
          )}
          <ClassFormField label="Hora">
            {(id) => (
              <TimePicker
                id={id}
                value={draft.startTime}
                onChange={(startTime) => onChange({ startTime })}
                invalid={Boolean(error) && !draft.startTime}
              />
            )}
          </ClassFormField>
          <ClassFormField
            label="Coach"
            hint={
              draft.legacyInstructor
                ? "Ese nombre se escribió a mano antes de los coaches. Elige un coach para reemplazarlo."
                : "Opcional, reemplaza el coach del programa."
            }
          >
            <ClassCoachSelect
              coaches={coaches}
              value={draft.coachId}
              onChange={(coachId) => onChange({ coachId })}
              noneLabel={draft.legacyInstructor || "Coach del programa"}
              aria-label="Coach"
            />
          </ClassFormField>
          <ClassFormField label="Cupos" hint="Opcional, reemplaza el valor del programa.">
            {(id) => (
              <Input
                id={id}
                inputMode="numeric"
                placeholder="Sin cambiar"
                value={draft.capacity}
                onChange={(e) => onChange({ capacity: digits(e.target.value) })}
              />
            )}
          </ClassFormField>
          <ClassFormField label="Duración (minutos)" hint="Opcional, reemplaza el valor del programa.">
            {(id) => (
              <Input
                id={id}
                inputMode="numeric"
                placeholder="Sin cambiar"
                value={draft.durationMinutes}
                onChange={(e) => onChange({ durationMinutes: digits(e.target.value) })}
              />
            )}
          </ClassFormField>
          {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}
