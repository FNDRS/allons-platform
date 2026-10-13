import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Field";
import type { useClassProgramForm } from "@/hooks/useClassProgramForm";
import { HONDURAS_CITIES } from "@/lib/hondurasCities";
import { ClassFormField } from "./ClassFormField";

const CITY_OPTIONS = HONDURAS_CITIES.map((city) => ({ value: city, label: city }));

type Props = Pick<
  ReturnType<typeof useClassProgramForm>,
  "pinned" | "locationName" | "setLocationName" | "address" | "setAddress" | "city" | "setCity"
>;

/**
 * Where the classes happen. A program whose spot was pinned on the app's map
 * shows that place read only: the pin decides the city, so editing the text
 * here would not change what clients see.
 */
export function ClassProgramLocationFields(p: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <ClassFormField label="Nombre del lugar (opcional)">
        <Input
          placeholder="Ej. Sala principal"
          value={p.locationName}
          onChange={(e) => p.setLocationName(e.target.value)}
        />
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
            <Input
              placeholder="Ej. Col. Palmira, frente al parque"
              value={p.address}
              onChange={(e) => p.setAddress(e.target.value)}
            />
          </ClassFormField>
          <ClassFormField label="Ciudad" hint="Es lo que ven tus clientes al buscar clases.">
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
