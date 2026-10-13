import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import type { useClassProgramForm } from "@/hooks/useClassProgramForm";
import { ClassFormField } from "./ClassFormField";

type Props = Pick<
  ReturnType<typeof useClassProgramForm>,
  | "title"
  | "setTitle"
  | "description"
  | "setDescription"
  | "instructorName"
  | "setInstructorName"
  | "durationMinutes"
  | "setDurationMinutes"
  | "capacityPerSession"
  | "setCapacityPerSession"
>;

/** Name, description, default instructor, session length and capacity. */
export function ClassProgramBasicsFields(p: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <ClassFormField label="Nombre del programa">
        <Input
          placeholder="Ej. Barre de mañana"
          value={p.title}
          maxLength={120}
          onChange={(e) => p.setTitle(e.target.value)}
        />
      </ClassFormField>
      <ClassFormField label="Descripción">
        <Textarea
          placeholder="Cuenta a tus clientes qué incluye este programa"
          value={p.description}
          rows={4}
          onChange={(e) => p.setDescription(e.target.value)}
        />
      </ClassFormField>
      <ClassFormField label="Instructor (por defecto)">
        <Input
          placeholder="Nombre del instructor"
          value={p.instructorName}
          onChange={(e) => p.setInstructorName(e.target.value)}
        />
      </ClassFormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <ClassFormField label="Duración por sesión (minutos)">
          <Input
            inputMode="numeric"
            placeholder="60"
            value={p.durationMinutes}
            onChange={(e) => p.setDurationMinutes(e.target.value)}
          />
        </ClassFormField>
        <ClassFormField
          label="Cupos por clase (por defecto)"
          hint="Cuántas personas caben en cada sesión, no en todo el programa."
        >
          <Input
            inputMode="numeric"
            placeholder="12"
            value={p.capacityPerSession}
            onChange={(e) => p.setCapacityPerSession(e.target.value)}
          />
        </ClassFormField>
      </div>
    </Card>
  );
}
