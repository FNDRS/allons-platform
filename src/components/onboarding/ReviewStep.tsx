"use client";

import { Pencil } from "lucide-react";
import { formatTime12 } from "@/components/ui/TimePicker";
import type { OnboardingForm } from "@/hooks/useOnboardingForm";
import { formatHNL } from "@/lib/format";
import {
  bankName,
  formatPhone,
  formatRtn,
  maskAccount,
  normalizeInstagram,
  normalizeWebsite,
  type OnboardingStep,
  type UploadedImage,
} from "@/lib/onboarding/validate";
import { StepHeading } from "./FormField";

const dateFmt = new Intl.DateTimeFormat("es-HN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type Row = [label: string, value: string | null];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function ReviewStep({ form }: { form: OnboardingForm }) {
  const { draft, edit, submitError } = form;
  const { company: c, billing: b, event: e } = draft;

  return (
    <div>
      <StepHeading
        title="Revisa y envía"
        description="Así nos llega tu información. Si algo no está bien, cámbialo antes de enviar."
      />
      <div className="grid gap-4">
        <Section
          title="Empresa"
          onEdit={() => edit("company")}
          rows={[
            ["Nombre", c.brandName],
            ["Persona a cargo", c.contactName],
            ["Correo", c.email],
            ["Teléfono", `+504 ${formatPhone(c.phone)}`],
            ["WhatsApp", c.whatsapp ? `+504 ${formatPhone(c.whatsapp)}` : null],
            ["Instagram", `@${normalizeInstagram(c.instagram)}`],
            ["Sitio web", normalizeWebsite(c.websiteUrl) || null],
            ["Sobre tu empresa", c.description.trim() || null],
          ]}
          images={c.logos}
        />
        <Section
          title="Pagos"
          onEdit={() => edit("billing")}
          rows={[
            ["Titular", b.accountHolder],
            ["Banco", bankName(b)],
            ["Cuenta", `${b.accountType === "ahorro" ? "Ahorros" : "Cheques"} ${maskAccount(b.accountNumber)}`],
            ["RTN", b.taxId ? formatRtn(b.taxId) : null],
          ]}
        />
        <Section
          title="Evento"
          onEdit={() => edit("event")}
          rows={[
            ["Nombre", e.title],
            ["Tipo", e.category],
            [
              "Cuándo",
              e.date && e.time
                ? capitalize(`${dateFmt.format(new Date(`${e.date}T12:00:00`))}, ${formatTime12(e.time)}`)
                : null,
            ],
            ["Dónde", [e.venue.trim(), e.address.trim()].filter(Boolean).join(", ")],
            ["Google Maps", e.mapsUrl || null],
            ["Entrada", e.isFree ? "Gratis" : formatHNL(Number(e.ticketPrice) || 0)],
            ["Cupos", e.capacity],
            ["Descripción", e.description.trim()],
          ]}
          images={e.croquis}
        />
      </div>
      {submitError ? (
        <p role="alert" className="mt-5 rounded-[14px] border border-danger/30 bg-danger/10 px-4 py-3 text-[14px] text-red-200">
          {submitError}
        </p>
      ) : null}
      <p className="mt-6 text-[13px] leading-relaxed text-dim">
        Al enviar confirmas que los datos son correctos. El equipo de Allons revisa tu solicitud y
        te escribe a {c.email || "tu correo"} para crear tu acceso.
      </p>
    </div>
  );
}

function Section({
  title,
  rows,
  images,
  onEdit,
}: {
  title: string;
  rows: Row[];
  images?: UploadedImage[];
  onEdit: () => void;
}) {
  return (
    <section className="rounded-[18px] border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold text-accent transition hover:bg-accent-soft"
          aria-label={`Editar ${title.toLowerCase()}`}
        >
          <Pencil className="size-3.5" aria-hidden />
          Editar
        </button>
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_1fr]">
        {rows
          .filter((row): row is [string, string] => Boolean(row[1]))
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-[13px] text-dim">{label}</dt>
              <dd className="-mt-2.5 whitespace-pre-line break-words text-[14.5px] text-white sm:mt-0">
                {value}
              </dd>
            </div>
          ))}
      </dl>
      {images && images.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.url}
              src={image.url}
              alt={image.name}
              className="size-14 rounded-[12px] border border-border object-cover"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
