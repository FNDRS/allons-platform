"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { SmoothInput } from "@/components/ui/SmoothInput";
import {
  cvvLength,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  maxDigits,
  type CardBrand,
  type CardDraft,
  type CardDraftErrors,
} from "@/lib/cards";
import { CardBrandMark } from "./CardBrandMark";
import { CardPreview } from "./CardPreview";

/**
 * The card fields. Values live in the parent's state only; the inputs are
 * plain text with numeric keyboards so a leading zero survives, carry the
 * `cc-*` autocomplete tokens so the browser's own wallet can fill them, and
 * are cleared by the parent after every attempt.
 */
export function CardForm({
  draft,
  brand,
  errors,
  showErrors,
  needsIdNumber,
  saveCard,
  disabled,
  onChange,
  onSaveCard,
}: {
  draft: CardDraft;
  brand: CardBrand;
  errors: CardDraftErrors;
  showErrors: boolean;
  needsIdNumber: boolean;
  saveCard: boolean;
  disabled?: boolean;
  onChange: (patch: Partial<CardDraft>) => void;
  onSaveCard: (value: boolean) => void;
}) {
  const [cvvFocused, setCvvFocused] = useState(false);
  const digits = digitsOnly(draft.number);
  const error = (key: keyof CardDraft) => (showErrors ? errors[key] : undefined);

  return (
    <div className="flex flex-col gap-6">
      <CardPreview
        digits={digits}
        name={draft.name}
        expiry={draft.expiry}
        cvv={draft.cvv}
        brand={brand}
        flipped={cvvFocused}
      />

      <form
        className="flex flex-col gap-4"
        autoComplete="on"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
        <label className="block">
          <Label>Número de tarjeta</Label>
          <SmoothInput
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={draft.number}
            disabled={disabled}
            maxLength={maxDigits(brand) + 5}
            aria-invalid={Boolean(error("number"))}
            prefix={<CardBrandMark brand={brand} className="h-5" />}
            onChange={(event) => {
              const next = digitsOnly(event.target.value).slice(0, maxDigits(brand));
              onChange({ number: formatCardNumber(next, brand) });
            }}
          />
          <FieldError>{error("number")}</FieldError>
        </label>

        <label className="block">
          <Label>Nombre en la tarjeta</Label>
          <Input
            autoComplete="cc-name"
            autoCapitalize="words"
            placeholder="Como aparece en la tarjeta"
            value={draft.name}
            disabled={disabled}
            maxLength={80}
            aria-invalid={Boolean(error("name"))}
            onChange={(event) => onChange({ name: event.target.value })}
          />
          <FieldError>{error("name")}</FieldError>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <Label>Vence</Label>
            <Input
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              value={draft.expiry}
              disabled={disabled}
              maxLength={5}
              aria-invalid={Boolean(error("expiry"))}
              onChange={(event) => onChange({ expiry: formatExpiry(event.target.value) })}
            />
            <FieldError>{error("expiry")}</FieldError>
          </label>
          <label className="block">
            <Label>CVV</Label>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder={"•".repeat(cvvLength(brand))}
              value={draft.cvv}
              disabled={disabled}
              maxLength={cvvLength(brand)}
              aria-invalid={Boolean(error("cvv"))}
              onFocus={() => setCvvFocused(true)}
              onBlur={() => setCvvFocused(false)}
              onChange={(event) =>
                onChange({ cvv: digitsOnly(event.target.value).slice(0, cvvLength(brand)) })
              }
            />
            <FieldError>{error("cvv")}</FieldError>
          </label>
        </div>

        {needsIdNumber ? (
          <label className="block">
            <Label hint="solo la primera vez">Número de identidad</Label>
            <Input
              inputMode="numeric"
              autoComplete="off"
              placeholder="0801199912345"
              value={draft.idNumber}
              disabled={disabled}
              maxLength={20}
              aria-invalid={Boolean(error("idNumber"))}
              onChange={(event) =>
                onChange({ idNumber: event.target.value.replace(/[^0-9A-Za-z-]/g, "") })
              }
            />
            <FieldError>{error("idNumber")}</FieldError>
            <p className="mt-1.5 text-[12px] leading-relaxed text-dim">
              Paygate lo pide para crear tu perfil de pago. Allons no lo guarda.
            </p>
          </label>
        ) : null}

        <SaveToggle checked={saveCard} disabled={disabled} onChange={onSaveCard} />
      </form>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-white/40">
        <Lock className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        Tus datos viajan cifrados y se guardan en la bóveda de Paygate (Clinpays).
        Allons nunca almacena el número completo ni el CVV.
      </p>
    </div>
  );
}

function SaveToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-[14px] border border-border bg-surface px-4 py-3 text-left transition hover:bg-surface-2 disabled:opacity-50"
    >
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold tracking-tight">
          Guardar para próximas compras
        </span>
        <span className="block text-[12px] text-dim">
          La próxima vez pagas en un toque.
        </span>
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-accent" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
