"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { EventEntryType, EventQuestion } from "@/lib/api/events";
import { formatCents, formatPriceCents } from "@/lib/format";
import type { HolderDraft } from "@/hooks/useReserveForm";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/Field";

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
      <SectionTitle>Tipo de entrada</SectionTitle>
      <div role="radiogroup" className="flex flex-col gap-2.5">
        {types.map((type) => {
          const active = type.id === value;
          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(type.id)}
              className={`flex items-center justify-between gap-4 rounded-[22px] border px-5 py-4 text-left transition ${
                active
                  ? "border-accent bg-accent/[0.08]"
                  : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-6 items-center justify-center rounded-full border ${
                    active ? "border-accent bg-accent text-black" : "border-white/25"
                  }`}
                >
                  {active ? <Check className="size-3.5" strokeWidth={3} /> : null}
                </span>
                <div>
                  <p className="font-semibold tracking-tight">{type.name}</p>
                  {type.remaining != null ? (
                    <p className="text-sm text-white/50">{type.remaining} disponibles</p>
                  ) : null}
                </div>
              </div>
              <p className="text-lg font-bold tracking-tight">
                {formatPriceCents(type.priceCents)}
              </p>
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
      <SectionTitle>Cantidad</SectionTitle>
      <Card className="flex items-center justify-between py-4">
        <p className="text-sm text-white/60">
          {value === 1 ? "1 ticket" : `${value} tickets`}
          {max < 10 ? ` · máx. ${max}` : ""}
        </p>
        <div className="flex items-center gap-3">
          <StepButton onClick={() => onChange(value - 1)} disabled={value <= 1} label="Quitar uno">
            <Minus className="size-4" />
          </StepButton>
          <span className="w-6 text-center text-xl font-bold tabular-nums">{value}</span>
          <StepButton onClick={() => onChange(value + 1)} disabled={value >= max} label="Agregar uno">
            <Plus className="size-4" />
          </StepButton>
        </div>
      </Card>
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
      className="flex size-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] transition hover:bg-white/[0.12] disabled:opacity-30"
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
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold tracking-tight">
          Ticket {index + 1} <span className="text-white/40">· {typeName}</span>
        </p>
        {isMe ? (
          <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[12px] font-semibold text-white/70">
            Para mí
          </span>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <Label>Nombre</Label>
          <Input
            value={holder.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Nombre completo"
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
            autoComplete={index === 0 ? "email" : "off"}
          />
          <FieldError>{showErrors ? errors.email : null}</FieldError>
        </label>
      </div>
      {questions.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-4">
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
    </Card>
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
          onClick={() => onChange(checked ? "No" : "Sí")}
          className="flex w-full items-start gap-3 text-left"
        >
          <span
            className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border ${
              checked ? "border-accent bg-accent text-black" : "border-white/25"
            }`}
          >
            {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
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
      <label className="block">
        <Label hint={hint}>{question.label}</Label>
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Elige una opción</option>
          {(question.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <FieldError>{error}</FieldError>
      </label>
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
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section>
      <SectionTitle>Aporte voluntario</SectionTitle>
      <Card>
        <p className="text-sm text-white/60">
          Este evento acepta un aporte extra además de la entrada. Es opcional.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-white/60">L</span>
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
      </Card>
    </section>
  );
}

export function ReserveSummary({
  quantity,
  typeName,
  ticketsCents,
  donationCents,
  totalCents,
  isFree,
}: {
  quantity: number;
  typeName: string;
  ticketsCents: number;
  donationCents: number;
  totalCents: number;
  isFree: boolean;
}) {
  return (
    <Card className="flex flex-col gap-2 text-sm">
      <Row label={`${quantity} × ${typeName}`} value={isFree ? "Gratis" : formatCents(ticketsCents)} />
      {donationCents > 0 ? <Row label="Aporte" value={formatCents(donationCents)} /> : null}
      <div className="mt-1 flex items-center justify-between border-t border-white/[0.08] pt-3">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold tracking-tight">
          {isFree ? "Gratis" : formatCents(totalCents)}
        </span>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-white/65">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
