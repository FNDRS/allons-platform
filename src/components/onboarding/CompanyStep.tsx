"use client";

import { useCallback } from "react";
import { Input, Textarea } from "@/components/ui/Field";
import { FileDrop } from "@/components/ui/FileDrop";
import { SmoothInput } from "@/components/ui/SmoothInput";
import type { OnboardingForm } from "@/hooks/useOnboardingForm";
import { uploadOnboardingFile } from "@/lib/api/onboarding";
import { digitsOnly, formatPhone, MAX_IMAGES } from "@/lib/onboarding/validate";
import { FormField, StepHeading } from "./FormField";

const PHONE_PREFIX = <span className="text-[15px] text-muted">+504</span>;

export function CompanyStep({ form, token }: { form: OnboardingForm; token: string }) {
  const { draft, errors, update, setFieldUploading } = form;
  const c = draft.company;
  const err = (field: string) => errors[`company.${field}`];
  const set = (patch: Partial<typeof c>) => update("company", patch);
  const onLogosBusy = useCallback((busy: boolean) => setFieldUploading("logos", busy), [setFieldUploading]);

  return (
    <div>
      <StepHeading
        title="Tu empresa"
        description="Con esto armamos tu perfil de comercio en Allons. Lo puedes cambiar después."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre de la empresa" error={err("brandName")} errorId="e-brandName">
          <Input
            value={c.brandName}
            onChange={(event) => set({ brandName: event.target.value })}
            placeholder="Allons Events"
            autoComplete="organization"
            maxLength={120}
            aria-invalid={Boolean(err("brandName"))}
            aria-describedby="e-brandName"
          />
        </FormField>
        <FormField label="Persona a cargo" error={err("contactName")} errorId="e-contactName">
          <Input
            value={c.contactName}
            onChange={(event) => set({ contactName: event.target.value })}
            placeholder="Nombre y apellido"
            autoComplete="name"
            maxLength={120}
            aria-invalid={Boolean(err("contactName"))}
            aria-describedby="e-contactName"
          />
        </FormField>
        <FormField
          label="Correo"
          hint="Aquí te llega el acceso"
          error={err("email")}
          errorId="e-email"
          className="sm:col-span-2"
        >
          <Input
            type="email"
            value={c.email}
            onChange={(event) => set({ email: event.target.value })}
            placeholder="tu@empresa.com"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(err("email"))}
            aria-describedby="e-email"
          />
        </FormField>
        <FormField label="Teléfono" error={err("phone")} errorId="e-phone">
          <SmoothInput
            prefix={PHONE_PREFIX}
            value={formatPhone(c.phone)}
            onChange={(event) => set({ phone: digitsOnly(event.target.value).slice(0, 8) })}
            placeholder="9999 9999"
            autoComplete="tel-national"
            inputMode="numeric"
            aria-invalid={Boolean(err("phone"))}
            aria-describedby="e-phone"
          />
        </FormField>
        <FormField label="WhatsApp" hint="Opcional" error={err("whatsapp")} errorId="e-whatsapp">
          <SmoothInput
            prefix={PHONE_PREFIX}
            value={formatPhone(c.whatsapp)}
            onChange={(event) => set({ whatsapp: digitsOnly(event.target.value).slice(0, 8) })}
            placeholder={c.phone ? formatPhone(c.phone) : "9999 9999"}
            inputMode="numeric"
            aria-invalid={Boolean(err("whatsapp"))}
            aria-describedby="e-whatsapp"
          />
          {c.phone.length === 8 && !c.whatsapp ? (
            <button
              type="button"
              onClick={() => set({ whatsapp: c.phone })}
              className="mt-1.5 text-[12.5px] font-semibold text-accent transition hover:text-[#ff7d24]"
            >
              Es el mismo teléfono
            </button>
          ) : null}
        </FormField>
        <FormField label="Instagram" error={err("instagram")} errorId="e-instagram">
          <SmoothInput
            prefix={<span className="text-[15px] text-muted">@</span>}
            value={c.instagram}
            onChange={(event) => set({ instagram: event.target.value })}
            placeholder="allons.hn"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={Boolean(err("instagram"))}
            aria-describedby="e-instagram"
          />
        </FormField>
        <FormField label="Sitio web" hint="Opcional" error={err("websiteUrl")} errorId="e-websiteUrl">
          <Input
            value={c.websiteUrl}
            onChange={(event) => set({ websiteUrl: event.target.value })}
            placeholder="tuempresa.com"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(err("websiteUrl"))}
            aria-describedby="e-websiteUrl"
          />
        </FormField>
        <FormField
          label="Sobre tu empresa"
          hint="Opcional"
          error={err("description")}
          errorId="e-description"
          className="sm:col-span-2"
        >
          <Textarea
            value={c.description}
            onChange={(event) => set({ description: event.target.value })}
            placeholder="Una o dos líneas que la gente verá en tu perfil."
            maxLength={500}
            rows={3}
            aria-invalid={Boolean(err("description"))}
            aria-describedby="e-description"
          />
          <span className="mt-1 block text-right text-[12px] tabular-nums text-dim">
            {c.description.length}/500
          </span>
        </FormField>
        <FormField
          group
          label="Logos"
          hint="El primero es tu foto de perfil"
          error={err("logos")}
          errorId="e-logos"
          className="sm:col-span-2"
        >
          <FileDrop
            files={c.logos}
            onChange={(logos) => set({ logos })}
            upload={(file, onProgress) => uploadOnboardingFile(token, "logo", file, onProgress)}
            onBusyChange={onLogosBusy}
            max={MAX_IMAGES}
            invalid={Boolean(err("logos"))}
            describedBy="e-logos"
            title="Arrastra tus logos aquí"
            primaryLabel="Perfil"
          />
        </FormField>
      </div>
    </div>
  );
}
