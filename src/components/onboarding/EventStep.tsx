"use client";

import { useCallback } from "react";
import { DateField } from "@/components/ui/DateField";
import { Combobox } from "@/components/ui/Combobox";
import { Input, Textarea } from "@/components/ui/Field";
import { FileDrop } from "@/components/ui/FileDrop";
import { SmoothInput } from "@/components/ui/SmoothInput";
import { Segmented } from "@/components/ui/Segmented";
import { TimePicker } from "@/components/ui/TimePicker";
import type { OnboardingForm } from "@/hooks/useOnboardingForm";
import { uploadOnboardingFile } from "@/lib/api/onboarding";
import { EVENT_CATEGORIES } from "@/lib/eventCategories";
import { MAX_IMAGES, todayInHonduras } from "@/lib/onboarding/validate";
import { FormField, StepHeading } from "./FormField";

const CATEGORY_OPTIONS = EVENT_CATEGORIES.map((category) => ({ value: category, label: category }));

export function EventStep({ form, token }: { form: OnboardingForm; token: string }) {
  const { draft, errors, update, setFieldUploading } = form;
  const e = draft.event;
  const err = (field: string) => errors[`event.${field}`];
  const set = (patch: Partial<typeof e>) => update("event", patch);
  const onCroquisBusy = useCallback(
    (busy: boolean) => setFieldUploading("croquis", busy),
    [setFieldUploading],
  );

  return (
    <div>
      <StepHeading
        title="Tu primer evento"
        description="Lo dejamos listo en borrador. Antes de publicarlo lo revisamos contigo."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre del evento" error={err("title")} errorId="e-title" className="sm:col-span-2">
          <Input
            value={e.title}
            onChange={(event) => set({ title: event.target.value })}
            placeholder="Sunset Run 5K"
            maxLength={120}
            aria-invalid={Boolean(err("title"))}
            aria-describedby="e-title"
          />
        </FormField>
        <FormField group label="Tipo de evento" error={err("category")} errorId="e-category" className="sm:col-span-2">
          <Combobox
            value={e.category}
            onChange={(category) => set({ category })}
            options={CATEGORY_OPTIONS}
            placeholder="Elige uno"
            searchPlaceholder="Buscar tipo de evento"
            aria-label="Tipo de evento"
            invalid={Boolean(err("category"))}
          />
        </FormField>
        <FormField label="Descripción" error={err("description")} errorId="e-eventDescription" className="sm:col-span-2">
          <Textarea
            value={e.description}
            onChange={(event) => set({ description: event.target.value })}
            placeholder="Qué va a pasar, para quién es y qué incluye la entrada."
            maxLength={2000}
            rows={5}
            aria-invalid={Boolean(err("description"))}
            aria-describedby="e-eventDescription"
          />
        </FormField>
        <FormField group label="Fecha" error={err("date")} errorId="e-date">
          <DateField
            value={e.date}
            min={todayInHonduras()}
            onChange={(date) => set({ date })}
            invalid={Boolean(err("date"))}
            describedBy="e-date"
          />
        </FormField>
        <FormField group label="Hora de inicio" error={err("time")} errorId="e-time">
          <TimePicker
            value={e.time}
            onChange={(time) => set({ time })}
            invalid={Boolean(err("time"))}
            describedBy="e-time"
          />
        </FormField>
        <FormField label="Lugar" hint="Opcional" error={err("venue")} errorId="e-venue">
          <Input
            value={e.venue}
            onChange={(event) => set({ venue: event.target.value })}
            placeholder="Parque Central"
            maxLength={120}
            aria-invalid={Boolean(err("venue"))}
            aria-describedby="e-venue"
          />
        </FormField>
        <FormField label="Dirección" error={err("address")} errorId="e-address">
          <Input
            value={e.address}
            onChange={(event) => set({ address: event.target.value })}
            placeholder="Colonia, calle, ciudad"
            maxLength={300}
            aria-invalid={Boolean(err("address"))}
            aria-describedby="e-address"
          />
        </FormField>
        <FormField
          label="Enlace de Google Maps"
          hint="Opcional, nos ayuda a ubicarlo exacto"
          error={err("mapsUrl")}
          errorId="e-mapsUrl"
          className="sm:col-span-2"
        >
          <Input
            value={e.mapsUrl}
            onChange={(event) => set({ mapsUrl: event.target.value.trim() })}
            placeholder="https://maps.app.goo.gl/..."
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(err("mapsUrl"))}
            aria-describedby="e-mapsUrl"
          />
        </FormField>
        <FormField group label="Entrada" error={err("ticketPrice")} errorId="e-ticketPrice">
          <div className="flex flex-col gap-3">
            <Segmented
              label="Tipo de entrada"
              value={e.isFree ? "free" : "paid"}
              onChange={(value) => set({ isFree: value === "free" })}
              options={[
                { value: "paid", label: "De pago" },
                { value: "free", label: "Gratis" },
              ]}
            />
            {e.isFree ? null : (
              <SmoothInput
                prefix={<span className="text-[15px] font-semibold text-muted">L</span>}
                value={e.ticketPrice}
                onChange={(event) =>
                  set({ ticketPrice: event.target.value.replace(/[^\d.]/g, "").slice(0, 9) })
                }
                placeholder="350"
                inputMode="decimal"
                aria-label="Precio de la entrada en lempiras"
                aria-invalid={Boolean(err("ticketPrice"))}
                aria-describedby="e-ticketPrice"
              />
            )}
          </div>
        </FormField>
        <FormField label="Cupos" hint="Personas en total" error={err("capacity")} errorId="e-capacity">
          <Input
            value={e.capacity}
            onChange={(event) => set({ capacity: event.target.value.replace(/\D/g, "").slice(0, 6) })}
            placeholder="150"
            inputMode="numeric"
            aria-invalid={Boolean(err("capacity"))}
            aria-describedby="e-capacity"
          />
        </FormField>
        <FormField
          group
          label="Croquis"
          hint="Sólo si tu evento es una clase"
          errorId="e-croquis"
          className="sm:col-span-2"
        >
          <FileDrop
            files={e.croquis}
            onChange={(croquis) => set({ croquis })}
            upload={(file, onProgress) => uploadOnboardingFile(token, "croquis", file, onProgress)}
            onBusyChange={onCroquisBusy}
            max={MAX_IMAGES}
            title="Plano del salón o de los puestos"
          />
        </FormField>
      </div>
    </div>
  );
}
