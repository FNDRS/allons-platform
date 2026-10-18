import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { Input, Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { useEventForm } from "@/hooks/useEventForm";
import type { ProviderEventType } from "@/lib/api/provider";
import { EVENT_CATEGORIES, EVENT_OTHER_CATEGORY } from "@/lib/eventCategories";

const CATEGORY_OPTIONS = EVENT_CATEGORIES.map((name) => ({ value: name, label: name }));

const EVENT_TYPE_OPTIONS: { value: ProviderEventType; label: string }[] = [
  { value: "single", label: "Evento único" },
  { value: "bundle", label: "Evento con sesiones" },
];

type Props = Pick<
  ReturnType<typeof useEventForm>,
  | "title"
  | "setTitle"
  | "description"
  | "setDescription"
  | "category"
  | "setCategory"
  | "customCategory"
  | "setCustomCategory"
  | "eventType"
  | "setEventType"
>;

/** Name, description, category and whether it is one event or several sessions. */
export function EventBasicsFields(p: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <ClassFormField label="Nombre del evento">
        {(id) => (
          <Input
            id={id}
            placeholder="Ej. Noche de jazz en la terraza"
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
            placeholder="Cuenta de qué se trata, quién se presenta y qué incluye la entrada"
            value={p.description}
            rows={5}
            onChange={(e) => p.setDescription(e.target.value)}
          />
        )}
      </ClassFormField>
      <ClassFormField label="Categoría" hint="Ayuda a que te encuentren al buscar eventos.">
        <Combobox
          aria-label="Categoría"
          value={p.category}
          onChange={p.setCategory}
          options={CATEGORY_OPTIONS}
          placeholder="Elige una categoría"
          searchPlaceholder="Buscar categoría"
        />
      </ClassFormField>
      {p.category === EVENT_OTHER_CATEGORY ? (
        <ClassFormField label="Nombre de la categoría">
          {(id) => (
            <Input
              id={id}
              placeholder="Ej. Stand-up"
              value={p.customCategory}
              maxLength={60}
              onChange={(e) => p.setCustomCategory(e.target.value)}
            />
          )}
        </ClassFormField>
      ) : null}
      <ClassFormField
        label="Tipo de evento"
        hint={
          p.eventType === "bundle"
            ? "Cada entrada es una sesión con su propia fecha, hora y lugar. La fecha y el lugar del evento son los generales."
            : "Una sola fecha y un solo lugar para todas las entradas."
        }
      >
        <Segmented
          label="Tipo de evento"
          value={p.eventType}
          options={EVENT_TYPE_OPTIONS}
          onChange={p.setEventType}
        />
      </ClassFormField>
    </Card>
  );
}
