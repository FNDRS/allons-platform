import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { Input, Textarea } from "@/components/ui/Field";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { useEventForm } from "@/hooks/useEventForm";
import { EVENT_CATEGORIES, EVENT_OTHER_CATEGORY } from "@/lib/eventCategories";

const CATEGORY_OPTIONS = EVENT_CATEGORIES.map((name) => ({ value: name, label: name }));

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
>;

/** Name, description and category. */
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
    </Card>
  );
}
