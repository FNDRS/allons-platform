import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Field";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { useEventForm } from "@/hooks/useEventForm";
import { HONDURAS_CITIES } from "@/lib/hondurasCities";

const CITY_OPTIONS = HONDURAS_CITIES.map((city) => ({ value: city, label: city }));

type Props = Pick<
  ReturnType<typeof useEventForm>,
  "pinned" | "venue" | "setVenue" | "address" | "setAddress" | "city" | "setCity"
>;

/**
 * Where the event happens. An event pinned on the app's map shows that spot
 * read only: the pin decides the city, so editing the text here would not
 * change what people see.
 */
export function EventLocationFields(p: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <ClassFormField label="Nombre del lugar">
        {(id) => (
          <Input
            id={id}
            placeholder="Ej. Teatro Nacional Manuel Bonilla"
            value={p.venue}
            onChange={(e) => p.setVenue(e.target.value)}
          />
        )}
      </ClassFormField>
      {p.pinned ? (
        <ClassFormField
          label="Ubicación"
          hint="Marcada en el mapa desde la app de Allons. Para moverla, edítala desde la app."
        >
          <p className="flex items-start gap-2 rounded-[14px] border border-border bg-surface-2 px-4 py-3 text-[14px] text-white/80">
            <MapPin className="mt-0.5 size-4 shrink-0 text-white/50" aria-hidden />
            {[p.address, p.city].filter(Boolean).join(" · ") || "Pin en el mapa"}
          </p>
        </ClassFormField>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <ClassFormField label="Dirección">
            {(id) => (
              <Input
                id={id}
                placeholder="Ej. Col. Palmira, frente al parque"
                value={p.address}
                onChange={(e) => p.setAddress(e.target.value)}
              />
            )}
          </ClassFormField>
          <ClassFormField label="Ciudad" hint="Es lo que ve la gente al buscar eventos.">
            <Combobox
              aria-label="Ciudad"
              value={p.city}
              onChange={p.setCity}
              options={CITY_OPTIONS}
              placeholder="Elige la ciudad"
              searchPlaceholder="Buscar ciudad"
            />
          </ClassFormField>
        </div>
      )}
    </Card>
  );
}
