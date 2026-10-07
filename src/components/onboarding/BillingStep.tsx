"use client";

import { ShieldCheck } from "lucide-react";
import { Input, Select, SelectItem } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import type { OnboardingForm } from "@/hooks/useOnboardingForm";
import { HN_BANKS, OTHER_BANK } from "@/lib/onboarding/banks";
import { digitsOnly, formatRtn } from "@/lib/onboarding/validate";
import { FormField, StepHeading } from "./FormField";

export function BillingStep({ form }: { form: OnboardingForm }) {
  const { draft, errors, update } = form;
  const b = draft.billing;
  const err = (field: string) => errors[`billing.${field}`];
  const set = (patch: Partial<typeof b>) => update("billing", patch);

  return (
    <div>
      <StepHeading
        title="¿Dónde te depositamos?"
        description="La cuenta a la que Allons te paga lo que vendas en tus eventos."
      />
      <div className="mb-6 flex items-center gap-4 rounded-[16px] border border-border bg-surface p-4">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-b from-accent to-accent-deep text-black shadow-[0_8px_24px_-6px_rgba(246,112,16,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-white/10">
          <ShieldCheck className="size-5" strokeWidth={2.25} aria-hidden />
        </span>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Estos datos sólo se usan para tus liquidaciones. En nuestro panel el número de cuenta
          aparece oculto, sólo con los últimos 4 dígitos.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Titular de la cuenta"
          hint="Persona o empresa"
          error={err("accountHolder")}
          errorId="e-accountHolder"
          className="sm:col-span-2"
        >
          <Input
            value={b.accountHolder}
            onChange={(event) => set({ accountHolder: event.target.value })}
            placeholder="Como aparece en el banco"
            maxLength={200}
            aria-invalid={Boolean(err("accountHolder"))}
            aria-describedby="e-accountHolder"
          />
        </FormField>
        <FormField group label="Banco" error={err("bank")} errorId="e-bank">
          <Select
            value={b.bank}
            onValueChange={(bank) => set({ bank })}
            placeholder="Elige tu banco"
            aria-label="Banco"
            aria-invalid={Boolean(err("bank"))}
          >
            {HN_BANKS.map((bank) => (
              <SelectItem key={bank} value={bank}>
                {bank}
              </SelectItem>
            ))}
            <SelectItem value={OTHER_BANK}>Otro banco</SelectItem>
          </Select>
        </FormField>
        <FormField group label="Tipo de cuenta" errorId="e-accountType">
          <Segmented
            label="Tipo de cuenta"
            value={b.accountType}
            onChange={(accountType) => set({ accountType })}
            options={[
              { value: "ahorro", label: "Ahorros" },
              { value: "cheques", label: "Cheques" },
            ]}
          />
        </FormField>
        {b.bank === OTHER_BANK ? (
          <FormField
            label="Nombre del banco"
            error={err("bankOther")}
            errorId="e-bankOther"
            className="sm:col-span-2"
          >
            <Input
              value={b.bankOther}
              onChange={(event) => set({ bankOther: event.target.value })}
              maxLength={120}
              aria-invalid={Boolean(err("bankOther"))}
              aria-describedby="e-bankOther"
            />
          </FormField>
        ) : null}
        <FormField label="Número de cuenta" error={err("accountNumber")} errorId="e-accountNumber">
          <Input
            value={b.accountNumber}
            onChange={(event) =>
              set({ accountNumber: event.target.value.replace(/[^\d-]/g, "").slice(0, 30) })
            }
            placeholder="0000000000"
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={Boolean(err("accountNumber"))}
            aria-describedby="e-accountNumber"
          />
        </FormField>
        <FormField label="RTN" hint="Opcional" error={err("taxId")} errorId="e-taxId">
          <Input
            value={formatRtn(b.taxId)}
            onChange={(event) => set({ taxId: digitsOnly(event.target.value).slice(0, 14) })}
            placeholder="0801-1999-123456"
            inputMode="numeric"
            aria-invalid={Boolean(err("taxId"))}
            aria-describedby="e-taxId"
          />
        </FormField>
      </div>
    </div>
  );
}
