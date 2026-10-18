import { ExternalLink, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/Field";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { useEventForm } from "@/hooks/useEventForm";
import type { useEventPin } from "@/hooks/event-form/useEventPin";
import { formatCoordinate, googleMapsUrl } from "@/lib/googleMapsLink";
import { HONDURAS_CITIES } from "@/lib/hondurasCities";

const CITY_OPTIONS = HONDURAS_CITIES.map((city) => ({ value: city, label: city }));

/** What the pin input reads and drives: `useEventPin`, or a ticket's own pin. */
export type EventPinControl = Pick<
  ReturnType<typeof useEventPin>,
  "pin" | "draft" | "setDraft" | "error" | "resolving" | "apply" | "clear"
>;

/**
 * Paste a Google Maps link or coordinates to place a pin, then see it with a
 * link to Maps and a way to remove it.
 */
export function EventPinInput({ id, pin }: { id: string; pin: EventPinControl }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={id}
          className="min-w-0 flex-1"
          placeholder="https://maps.app.goo.gl/... o 14.0723, -87.1921"
          value={pin.draft}
          aria-invalid={pin.error ? true : undefined}
          onChange={(e) => pin.setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter here places the pin; it must not submit anything.
            if (e.key !== "Enter") return;
            e.preventDefault();
            pin.apply();
          }}
        />
        <Button
          type="button"
          variant="secondary"
          loading={pin.resolving}
          onClick={pin.apply}
        >
          {pin.pin ? "Cambiar pin" : "Ubicar"}
        </Button>
      </div>
      {pin.error ? (
        <p className="text-[13px] text-red-400">{pin.error}</p>
      ) : null}
      {pin.pin ? (
        <div className="flex items-center gap-2 rounded-[14px] border border-border bg-surface-2 px-4 py-3 text-[14px] text-white/80">
          <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
          <span className="min-w-0 flex-1 truncate tabular-nums">
            {formatCoordinate(pin.pin.latitude)}, {formatCoordinate(pin.pin.longitude)}
          </span>
          <a
            href={googleMapsUrl(pin.pin)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[13px] text-white/60 transition hover:text-white"
          >
            Ver en Maps <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <button
            type="button"
            onClick={pin.clear}
            aria-label="Quitar pin"
            className="rounded-full p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}

type Props = Pick<
  ReturnType<typeof useEventForm>,
  "location" | "venue" | "setVenue" | "address" | "setAddress" | "city" | "setCity"
>;

/**
 * Where the event happens. The pin comes from a Google Maps link or typed
 * coordinates, same as in allons-admin; with a pin set, the API takes the city
 * from it, so the typed address and city become optional.
 */
export function EventLocationFields(p: Props) {
  const { location } = p;
  const pinned = location.pin !== null;

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

      <ClassFormField
        label="Cómo llegar"
        hint="El pin que abre la gente en Google Maps para llegar. Pega el link del lugar (Compartir > Copiar enlace) o sus coordenadas."
      >
        {(id) => (
          <EventPinInput id={id} pin={location} />
        )}
      </ClassFormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <ClassFormField label={pinned ? "Dirección (opcional)" : "Dirección"}>
          {(id) => (
            <Input
              id={id}
              placeholder="Ej. Col. Palmira, frente al parque"
              value={p.address}
              onChange={(e) => p.setAddress(e.target.value)}
            />
          )}
        </ClassFormField>
        <ClassFormField
          label={pinned ? "Ciudad (opcional)" : "Ciudad"}
          hint={pinned ? "Si la dejas vacía, la tomamos del pin." : "Es lo que ve la gente al buscar eventos."}
        >
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
    </Card>
  );
}
