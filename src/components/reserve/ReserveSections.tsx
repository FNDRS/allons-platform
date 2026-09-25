"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { EventEntryType, EventQuestion } from "@/lib/api/events";
import { formatCents, formatPriceCents } from "@/lib/format";
import type { HolderDraft } from "@/hooks/useReserveForm";
import { FieldError, Input, Label, Select, SelectItem, Textarea } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/Pill";

export function StepHeading({
  n,
  children,
  hint,
}: {
  n: number;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex min-w-0 flex-wrap items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-[10px] font-bold tabular-nums tracking-[0.08em] text-white/40">
        {String(n).padStart(2, "0")}
      </span>
      <h2 className="min-w-0 text-[15px] font-semibold tracking-tight text-white/90">
        {children}
      </h2>
      {hint ? <span className="text-[12px] text-white/35">{hint}</span> : null}
    </div>
  );
}

function Shell({
  children,
  className = "",
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] p-[1px] transition-[background] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        active
          ? "bg-gradient-to-br from-accent/70 via-accent/20 to-white/10"
          : "bg-white/[0.08]"
      } ${className}`}
    >
      <div
        className={`rounded-[25px] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          active ? "bg-[#14110e]" : "bg-[#0c0c0e]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function EntryTypePicker({
  types,
  value,
  onChange,
}: {
  types: EventEntryType[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <section>
      <StepHeading n={1}>Entrada</StepHeading>
      <div role="radiogroup" aria-label="Tipo de entrada" className="flex flex-col gap-2.5">
        {types.map((type) => {
          const active = type.id === value;
          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(type.id)}
              className="text-left transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]"
            >
              <Shell active={active}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                        active
                          ? "border-accent bg-accent text-black"
                          : "border-white/20"
                      }`}
                    >
                      {active ? (
                        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                      ) : null}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight">{type.name}</p>
                      {type.remaining != null ? (
                        <p className="mt-0.5 text-[13px] text-white/40">
                          {type.remaining} disponibles
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p
                    className={`shrink-0 text-[17px] font-bold tracking-tight ${
                      active ? "text-accent" : "text-white"
                    }`}
                  >
                    {formatPriceCents(type.priceCents)}
                  </p>
                </div>
              </Shell>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function QuantityStepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <section>
      <StepHeading n={2}>Cantidad</StepHeading>
      <Shell>
        <div className="flex items-center justify-between py-1">
          <p className="text-[14px] text-white/50" aria-live="polite">
            {value === 1 ? "1 ticket" : `${value} tickets`}
            {max < 10 ? ` · máx. ${max}` : ""}
          </p>
          <div className="flex items-center gap-3">
            <StepButton
              onClick={() => onChange(value - 1)}
              disabled={value <= 1}
              label="Quitar uno"
            >
              <Minus className="size-4" strokeWidth={1.75} aria-hidden />
            </StepButton>
            <span className="w-7 text-center text-[20px] font-bold tabular-nums" aria-hidden>
              {value}
            </span>
            <StepButton
              onClick={() => onChange(value + 1)}
              disabled={value >= max}
              label="Agregar uno"
            >
              <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            </StepButton>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.1] disabled:opacity-25"
    >
      {children}
    </button>
  );
}

export function HolderCard({
  index,
  holder,
  errors,
  showErrors,
  questions,
  typeName,
  isMe,
  onChange,
  onAnswer,
}: {
  index: number;
  holder: HolderDraft;
  errors: { name?: string; email?: string; answers: string[] };
  showErrors: boolean;
  questions: EventQuestion[];
  typeName: string;
  isMe: boolean;
  onChange: (patch: Partial<HolderDraft>) => void;
  onAnswer: (questionId: string, value: string) => void;
}) {
  return (
    <Shell>
      <div className="flex flex-col gap-4 py-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14px] font-semibold tracking-tight">
            Ticket {index + 1}
            <span className="font-medium text-white/35"> · {typeName}</span>
          </p>
          {isMe ? <StatusPill tone="glass">Para mí</StatusPill> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <Label>Nombre</Label>
            <Input
              value={holder.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="Nombre completo"
              aria-invalid={showErrors && Boolean(errors.name)}
              autoComplete={index === 0 ? "name" : "off"}
            />
            <FieldError>{showErrors ? errors.name : null}</FieldError>
          </label>
          <label className="block">
            <Label>Correo</Label>
            <Input
              type="email"
              inputMode="email"
              value={holder.email}
              onChange={(event) => onChange({ email: event.target.value })}
              placeholder="correo@ejemplo.com"
              aria-invalid={showErrors && Boolean(errors.email)}
              autoComplete={index === 0 ? "email" : "off"}
            />
            <FieldError>{showErrors ? errors.email : null}</FieldError>
          </label>
        </div>
        {questions.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4">
            {questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={holder.answers[question.id] ?? ""}
                onChange={(value) => onAnswer(question.id, value)}
                error={
                  showErrors && errors.answers.includes(question.id)
                    ? question.kind === "boolean"
                      ? "Necesitamos tu confirmación"
                      : "Respuesta requerida"
                    : null
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </Shell>
  );
}

function QuestionField({
  question,
  value,
  onChange,
  error,
}: {
  question: EventQuestion;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}) {
  const hint = question.required ? undefined : "(opcional)";
  const kind = question.kind;
  if (kind === "boolean" || kind === "checkbox") {
    const checked = value === "Sí";
    return (
      <div>
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-invalid={Boolean(error)}
          onClick={() => onChange(checked ? "No" : "Sí")}
          className="flex w-full items-start gap-3 text-left"
        >
          <span
            className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border ${
              checked ? "border-accent bg-accent text-black" : "border-white/25"
            }`}
          >
            {checked ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : null}
          </span>
          <span className="text-[15px] leading-6 text-white/85">
            {question.label}
            {hint ? <span className="ml-1 text-white/35">{hint}</span> : null}
          </span>
        </button>
        <FieldError>{error}</FieldError>
      </div>
    );
  }
  if (kind === "select" || kind === "radio") {
    return (
      <div>
        <Label hint={hint}>{question.label}</Label>
        <Select
          value={value}
          onValueChange={onChange}
          placeholder="Elige una opción"
          aria-label={question.label}
        >
          {(question.options ?? []).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </Select>
        <FieldError>{error}</FieldError>
      </div>
    );
  }
  if (kind === "textarea") {
    return (
      <label className="block">
        <Label hint={hint}>{question.label}</Label>
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
        <FieldError>{error}</FieldError>
      </label>
    );
  }
  return (
    <label className="block">
      <Label hint={hint}>{question.label}</Label>
      <Input
        type={kind === "number" ? "number" : kind === "date" ? "date" : "text"}
        inputMode={kind === "number" ? "numeric" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError>{error}</FieldError>
    </label>
  );
}

export function DonationField({
  value,
  onChange,
  step = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  step?: number;
}) {
  return (
    <section>
      <StepHeading n={step} hint="opcional">
        Aporte
      </StepHeading>
      <Shell>
        <p className="text-[14px] leading-6 text-white/50">
          Este evento acepta un aporte extra además de la entrada.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-white/40">L</span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="1"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="0"
            className="max-w-40"
            aria-label="Aporte en lempiras"
          />
        </div>
      </Shell>
    </section>
  );
}

/**
 * Identidad de quien paga. Clinpays no abre su formulario sin ella, así que se
 * pide aquí, antes de salir al pago, y no como un rechazo después.
 */
export function GovernmentIdField({
  value,
  onChange,
  step,
  showError,
}: {
  value: string;
  onChange: (value: string) => void;
  step: number;
  /** Tras intentar pagar con el campo vacío o mal escrito. */
  showError: boolean;
}) {
  return (
    <section>
      <StepHeading n={step}>Tu identidad</StepHeading>
      <Shell>
        <p className="text-[14px] leading-6 text-white/50">
          Clinpays pide el número de identidad de quien paga para abrir el
          formulario. Se manda a la pasarela; Allons no lo guarda.
        </p>
        <div className="mt-3">
          <Input
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="0801-1999-12345"
            maxLength={30}
            value={value}
            aria-label="Número de identidad"
            aria-invalid={showError}
            onChange={(event) => onChange(event.target.value)}
            className="max-w-xs tracking-[0.04em]"
          />
          {showError ? (
            <p role="alert" className="mt-2 text-sm text-red-300">
              Escríbelo tal como aparece en el documento.
            </p>
          ) : null}
        </div>
      </Shell>
    </section>
  );
}

export function ReserveSummary({
  quantity,
  typeName,
  ticketsCents,
  donationCents,
  serviceChargeCents,
  discount,
  totalCents,
  isFree,
}: {
  quantity: number;
  typeName: string;
  ticketsCents: number;
  donationCents: number;
  /**
   * Recargo que cotizó el servidor. Antes esto era un 8% calculado aquí que
   * no se sumaba al total y que tampoco correspondía a nada que se cobrara:
   * ese 8% es la comisión que se le retiene al comercio, no algo que pague
   * quien compra.
   */
  serviceChargeCents: number;
  discount?: { code: string; percent: number; amountCents: number } | null;
  totalCents: number;
  isFree: boolean;
}) {
  const platformFeeCents = isFree ? 0 : serviceChargeCents;

  return (
    <Shell>
      <div className="flex flex-col gap-2.5 py-1 text-[14px]">
        <Row
          label={`${quantity} × ${typeName}`}
          value={isFree ? "Gratis" : formatCents(ticketsCents)}
        />
        {discount ? (
          <Row
            label={`Código ${discount.code} (-${discount.percent}%)`}
            value={`-${formatCents(discount.amountCents)}`}
            tone="accent"
          />
        ) : null}
        {platformFeeCents > 0 ? (
          <Row
            label="Cargo por servicio"
            value={formatCents(platformFeeCents)}
          />
        ) : null}
        {donationCents > 0 ? (
          <Row label="Aporte" value={formatCents(donationCents)} />
        ) : null}
        <div className="mt-1 flex items-baseline justify-between border-t border-white/[0.06] pt-3">
          <span className="text-[13px] font-medium text-white/45">Total</span>
          <span className="text-[22px] font-bold tracking-tight">
            {/* A promo code can zero a paid ticket's total same as a free
                one does; either way there's nothing to charge. */}
            {totalCents === 0 ? "Gratis" : formatCents(totalCents)}
          </span>
        </div>
      </div>
    </Shell>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className="flex items-center justify-between text-white/45">
      <span className="truncate">{label}</span>
      <span
        className={`shrink-0 pl-3 font-medium ${
          tone === "accent" ? "text-accent" : "text-white/85"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Un código sólo viaja al servidor cuando el comprador confirma "Aplicar":
 * escribirlo no gasta un uso de un código que luego no se cobra.
 */
export function PromoCodeField({
  value,
  onChange,
  onApply,
  onRemove,
  applied,
  applying,
  error,
  step,
}: {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
  applied: { code: string; percent: number } | null;
  applying: boolean;
  error: string | null;
  step: number;
}) {
  return (
    <section>
      <StepHeading n={step} hint="opcional">
        Código promocional
      </StepHeading>
      <Shell active={Boolean(applied)}>
        {applied ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent bg-accent/15 text-accent">
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              <p className="min-w-0 truncate text-[14px] font-semibold tracking-tight">
                {applied.code}
                <span className="font-medium text-white/40">
                  {" "}
                  · {applied.percent}% de descuento
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 text-[13px] font-semibold text-white/40 transition hover:text-white"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2">
              <Input
                value={value}
                onChange={(event) => onChange(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onApply();
                  }
                }}
                placeholder="Escribe tu código"
                autoCapitalize="characters"
                maxLength={64}
                className="tracking-[0.06em]"
                aria-label="Código promocional"
              />
              <button
                type="button"
                onClick={onApply}
                disabled={!value.trim() || applying}
                className="shrink-0 rounded-2xl border border-white/15 bg-white/[0.06] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.1] disabled:opacity-40"
              >
                {applying ? "Aplicando…" : "Aplicar"}
              </button>
            </div>
            <FieldError>{error}</FieldError>
          </div>
        )}
      </Shell>
    </section>
  );
}
