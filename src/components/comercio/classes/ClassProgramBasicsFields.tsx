import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import type { useClassProgramForm } from "@/hooks/useClassProgramForm";
import { ClassCoachSelect } from "./ClassCoachSelect";
import { ClassFormField } from "./ClassFormField";

type Props = Pick<
  ReturnType<typeof useClassProgramForm>,
  | "title"
  | "setTitle"
  | "description"
  | "setDescription"
  | "coaches"
  | "coachId"
  | "setCoachId"
  | "legacyInstructor"
  | "durationMinutes"
  | "setDurationMinutes"
  | "capacityPerSession"
  | "setCapacityPerSession"
>;

/** Name, description, default coach, session length and capacity. */
export function ClassProgramBasicsFields(p: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <ClassFormField label="Nombre del programa">
        {(id) => (
          <Input
            id={id}
            placeholder="Ej. Barre de mañana"
            value={p.title}
            maxLength={120}
            onChange={(e) => p.setTitle(e.target.value)}
          />
        )}
      </ClassFormField>
      <ClassFormField label="Descripción">
        {(id) => (
          <Textarea
            id={id}
            placeholder="Cuenta a tus clientes qué incluye este programa"
            value={p.description}
            rows={4}
            onChange={(e) => p.setDescription(e.target.value)}
          />
        )}
      </ClassFormField>
      <ClassFormField
        label="Coach (por defecto)"
        hint={
          p.legacyInstructor
            ? "Ese nombre se escribió a mano antes de los coaches. Elige un coach para reemplazarlo."
            : "Los coaches se agregan en la pestaña Coaches de Clases."
        }
      >
        <ClassCoachSelect
          coaches={p.coaches}
          value={p.coachId}
          onChange={p.setCoachId}
          noneLabel={p.legacyInstructor ?? "Sin coach"}
          aria-label="Coach por defecto"
        />
      </ClassFormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ClassFormField label="Duración por sesión (minutos)">
          {(id) => (
            <Input
              id={id}
              inputMode="numeric"
              placeholder="60"
              value={p.durationMinutes}
              onChange={(e) => p.setDurationMinutes(e.target.value)}
            />
          )}
        </ClassFormField>
        <ClassFormField
          label="Cupos por clase (por defecto)"
          hint="Cuántas personas caben en cada sesión, no en todo el programa."
        >
          {(id) => (
            <Input
              id={id}
              inputMode="numeric"
              placeholder="12"
              value={p.capacityPerSession}
              onChange={(e) => p.setCapacityPerSession(e.target.value)}
            />
          )}
        </ClassFormField>
      </div>
    </Card>
  );
}
