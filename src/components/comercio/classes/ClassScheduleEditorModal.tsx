import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Chip } from "@/components/ui/Pill";
import { TimePicker } from "@/components/ui/TimePicker";
import { WEEKDAY_LABELS, WEEKDAY_OPTIONS } from "@/hooks/class-program-form/constants";
import type { ClassScheduleDraft } from "@/hooks/class-program-form/useClassSessionTemplatesForm";
import { ClassFormField } from "./ClassFormField";

const digits = (value: string) => value.replace(/\D/g, "");

/** Authors one weekly slot: day, time and optional per-slot overrides. */
export function ClassScheduleEditorModal({
  draft,
  error,
  onChange,
  onCancel,
  onConfirm,
}: {
  draft: ClassScheduleDraft | null;
  error: string | null;
  onChange: (patch: Partial<ClassScheduleDraft>) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={Boolean(draft)}
      onClose={onCancel}
      title="Horario recurrente"
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
          <ClassFormField label="Día">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Día de la semana">
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
          <ClassFormField label="Hora">
            <TimePicker
              value={draft.startTime}
              onChange={(startTime) => onChange({ startTime })}
              invalid={Boolean(error) && !draft.startTime}
            />
          </ClassFormField>
          <ClassFormField label="Cupos" hint="Opcional, reemplaza el valor del programa.">
            <Input
              inputMode="numeric"
              placeholder="Sin cambiar"
              value={draft.capacity}
              onChange={(e) => onChange({ capacity: digits(e.target.value) })}
            />
          </ClassFormField>
          <ClassFormField label="Instructor" hint="Opcional, reemplaza el valor del programa.">
            <Input
              placeholder="Sin cambiar"
              value={draft.instructorName}
              onChange={(e) => onChange({ instructorName: e.target.value })}
            />
          </ClassFormField>
          <ClassFormField label="Duración (minutos)" hint="Opcional, reemplaza el valor del programa.">
            <Input
              inputMode="numeric"
              placeholder="Sin cambiar"
              value={draft.durationMinutes}
              onChange={(e) => onChange({ durationMinutes: digits(e.target.value) })}
            />
          </ClassFormField>
          {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}
