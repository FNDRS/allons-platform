"use client";

import { useState } from "react";
import { DateField } from "@/components/ui/DateField";
import { Input, Textarea } from "@/components/ui/Field";
import { TimePicker } from "@/components/ui/TimePicker";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import {
  MAX_SESSION_DESCRIPTION,
  MAX_SESSION_PLACE,
  type EventTicketDraft,
} from "@/hooks/event-form/useEventTicketsForm";
import { resolveMapPin, reverseGeocode } from "@/hooks/event-form/useEventPin";
import { todayHN } from "@/lib/dateKeys";
import { EventPinInput } from "./EventLocationFields";

/**
 * The session a ticket type is in a bundle event: what it is, when and
 * where. Blank fields use the event's. The pin is read the same way as the
 * event's, from a Google Maps link or typed coordinates.
 */
export function EventTicketSessionFields({
  draft,
  onChange,
}: {
  draft: EventTicketDraft;
  onChange: (patch: Partial<EventTicketDraft>) => void;
}) {
  const [pinDraft, setPinDraft] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const pin =
    draft.latitude !== null && draft.longitude !== null
      ? { latitude: draft.latitude, longitude: draft.longitude }
      : null;
  const today = todayHN();
  const minDate = draft.sessionDate && draft.sessionDate < today ? draft.sessionDate : today;
  const nextDay =
    Boolean(draft.sessionStartTime && draft.sessionEndTime) &&
    draft.sessionEndTime < draft.sessionStartTime;

  const applyPin = async () => {
    const raw = pinDraft.trim();
    if (!raw) {
      setPinError("Pega el link de Google Maps o las coordenadas.");
      return;
    }
    setPinError(null);
    setResolving(true);
    try {
      const result = await resolveMapPin(raw);
      if (typeof result === "string") {
        setPinError(result);
        return;
      }
      onChange({ latitude: result.latitude, longitude: result.longitude });
      setPinDraft("");
      const place = await reverseGeocode(result);
      // Only fills a blank address: a typed one beats the geocoder's.
      if (place?.address && !draft.address.trim()) onChange({ address: place.address });
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-border bg-surface p-4">
      <div>
        <p className="text-[14px] font-semibold tracking-tight">La sesión</p>
        <p className="text-[12px] leading-5 text-dim">
          Lo que dejes vacío toma la fecha y el lugar del evento.
        </p>
      </div>
      <ClassFormField label="Descripción (opcional)">
        {(id) => (
          <Textarea
            id={id}
            placeholder="Qué se hace en esta sesión, quién la da, qué llevar"
            value={draft.description}
            rows={3}
            maxLength={MAX_SESSION_DESCRIPTION}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        )}
      </ClassFormField>
      <ClassFormField label="Fecha">
        {(id) => (
          <DateField
            id={id}
            value={draft.sessionDate}
            min={minDate}
            onChange={(sessionDate) => onChange({ sessionDate })}
            placeholder="La del evento"
          />
        )}
      </ClassFormField>
      <div className="grid grid-cols-2 gap-2">
        <ClassFormField label="Hora de inicio">
          {(id) => (
            <TimePicker
              id={id}
              value={draft.sessionStartTime}
              onChange={(sessionStartTime) => onChange({ sessionStartTime })}
            />
          )}
        </ClassFormField>
        <ClassFormField label="Hora de fin">
          {(id) => (
            <TimePicker
              id={id}
              value={draft.sessionEndTime}
              onChange={(sessionEndTime) => onChange({ sessionEndTime })}
            />
          )}
        </ClassFormField>
      </div>
      {draft.sessionDate || draft.sessionStartTime || draft.sessionEndTime ? (
        <div className="-mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] leading-5 text-dim">
            {nextDay ? "Termina al día siguiente." : ""}
          </p>
          <button
            type="button"
            onClick={() => onChange({ sessionDate: "", sessionStartTime: "", sessionEndTime: "" })}
            className="w-fit text-[12px] font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Usar la fecha del evento
          </button>
        </div>
      ) : null}
      <ClassFormField label="Nombre del lugar">
        {(id) => (
          <Input
            id={id}
            placeholder="El del evento"
            value={draft.venue}
            maxLength={MAX_SESSION_PLACE}
            onChange={(e) => onChange({ venue: e.target.value })}
          />
        )}
      </ClassFormField>
      <ClassFormField label="Dirección">
        {(id) => (
          <Input
            id={id}
            placeholder="Ej. Col. Palmira, frente al parque"
            value={draft.address}
            maxLength={MAX_SESSION_PLACE}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        )}
      </ClassFormField>
      <ClassFormField
        label="Cómo llegar"
        hint="Pega el link del lugar en Google Maps o sus coordenadas."
      >
        {(id) => (
          <EventPinInput
            id={id}
            pin={{
              pin,
              draft: pinDraft,
              setDraft: (value) => {
                setPinDraft(value);
                setPinError(null);
              },
              error: pinError,
              resolving,
              apply: () => void applyPin(),
              clear: () => {
                onChange({ latitude: null, longitude: null });
                setPinError(null);
              },
            }}
          />
        )}
      </ClassFormField>
    </div>
  );
}
