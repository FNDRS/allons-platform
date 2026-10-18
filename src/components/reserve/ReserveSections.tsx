"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useId, useState } from "react";
import {
  allOptionsSoldOut,
  isEntryTypeOnSale,
  isSoldOutOption,
  type EventCampaign,
  type EventEntryType,
  type EventQuestion,
} from "@/lib/api/events";
import { formatCents, formatDateTime } from "@/lib/format";
import { ListedPrice } from "@/components/ui/ListedPrice";
import { sessionSubtitle } from "@/components/events/EntryTypeSessionModal";
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
  priceCentsFor,
}: {
  types: EventEntryType[];
  value: string | null;
  onChange: (id: string) => void;
  /** Null while the buyer-facing quote is still loading. */
  priceCentsFor?: (listCents: number) => number | null;
}) {
  return (
    <section>
      <StepHeading n={1}>Entrada</StepHeading>
      <div role="radiogroup" aria-label="Tipo de entrada" className="flex flex-col gap-2.5">
        {types.map((type) => {
          const active = type.id === value;
          const opensAt =
            !isEntryTypeOnSale(type) && type.saleStartsAt
              ? formatDateTime(type.saleStartsAt)
              : null;
          const subtitle = sessionSubtitle(type);
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
                      {subtitle ? (
                        <p className="mt-0.5 text-[13px] text-white/60">{subtitle}</p>
                      ) : null}
                      {opensAt ? (
                        <p className="mt-0.5 text-[13px] text-white/40">
                          A la venta desde {opensAt}
                        </p>
                      ) : type.remaining != null ? (
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
                    <ListedPrice
                      cents={(priceCentsFor ?? ((cents) => cents))(type.priceCents)}
                    />
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

/** What the picked entry includes, written by the organizer. */
export function EntryTypeDetails({ text, step }: { text: string; step: number }) {
  return (
    <section>
      <StepHeading n={step}>Detalles</StepHeading>
      <Shell>
        <p className="whitespace-pre-line py-1 text-[14px] leading-relaxed text-white/70">
          {text}
        </p>
      </Shell>
    </section>
  );
}

export function QuantityStepper({
  value,
  max,
  onChange,
  step = 2,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <section>
      <StepHeading n={step}>Cantidad</StepHeading>
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
                    ? answerError(question, holder.answers[question.id] ?? "")
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

function answerError(question: EventQuestion, value: string): string {
  if (value.trim() && isSoldOutOption(question, value.trim())) {
    return "Esta opción se agotó, elige otra.";
  }
  if (allOptionsSoldOut(question)) return "No quedan opciones disponibles.";
  return question.kind === "boolean" ? "Necesitamos tu confirmación" : "Respuesta requerida";
}

/** Up to this many options render as buttons; more go in a dropdown. */
const CHOICE_CHIPS_MAX = 8;

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
  const options = question.options ?? [];
  // Shown before any submit: the buyer should not fill everything else first
  // to learn there is nothing left to pick.
  const noneLeft =
    (kind === "select" || kind === "radio") && allOptionsSoldOut(question) ? (
      <p className="mt-2 text-[13px] text-white/50">No quedan opciones disponibles.</p>
    ) : null;
  // A short list (sizes, yes/maybe/no) reads better as buttons than behind a
  // dropdown, and keeps the page scrollable: Radix Select locks the scroll
  // while open, which trapped buyers whose list ran under the total bar.
  if ((kind === "select" || kind === "radio") && options.length <= CHOICE_CHIPS_MAX) {
    return (
      <div>
        <Label hint={hint}>{question.label}</Label>
        <div
          role="radiogroup"
          aria-label={question.label}
          aria-invalid={Boolean(error)}
          className="flex flex-wrap gap-2"
        >
          {options.map((option) => {
            const selected = value === option;
            const soldOut = isSoldOutOption(question, option);
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-disabled={soldOut}
                disabled={soldOut && !selected}
                aria-label={soldOut ? `${option}, agotada` : undefined}
                onClick={() => (soldOut ? onChange("") : onChange(option))}
                className={`flex h-11 min-w-12 items-center gap-2 rounded-[12px] border px-4 text-[15px] font-semibold transition ${
                  soldOut
                    ? selected
                      ? "border-danger/60 bg-surface-2 text-white/40"
                      : "cursor-not-allowed border-border bg-surface-2 text-white/30"
                    : selected
                      ? "border-accent bg-accent text-black"
                      : "border-border bg-surface-2 text-white/85 hover:border-border-strong hover:bg-white/[0.08]"
                }`}
              >
                <span className={soldOut ? "line-through" : undefined}>{option}</span>
                {soldOut ? (
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
                    Agotada
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {noneLeft}
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
          aria-invalid={Boolean(error)}
        >
          {options.map((option) => {
            const soldOut = isSoldOutOption(question, option);
            return (
              <SelectItem key={option} value={option} disabled={soldOut}>
                {soldOut ? `${option} (agotada)` : option}
              </SelectItem>
            );
          })}
        </Select>
        {noneLeft}
        <FieldError>{error}</FieldError>
      </div>
    );
  }
  if (kind === "textarea") {
    return (
      <label className="block">
        <Label hint={hint}>{question.label}</Label>
        <Textarea
          value={value}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
        />
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
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError>{error}</FieldError>
    </label>
  );
}

/** "L 100", or "L 99.50" when there are cents. */
function formatLempiras(cents: number): string {
  return `L ${(cents / 100).toLocaleString("es-HN", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function DonationField({
  value,
  onChange,
  suggestedCents,
  step = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  /**
   * What the organizer suggests, in cents. Shown as a button that fills the
   * amount; the field itself starts empty, because a contribution is not
   * refundable and a prefilled one ends up paid by accident.
   */
  suggestedCents?: number | null;
  step?: number;
}) {
  const suggestion =
    suggestedCents != null && suggestedCents > 0 ? suggestedCents : null;
  const typedCents = Math.round((Number(value) || 0) * 100);
  const suggestionPicked = suggestion !== null && typedCents === suggestion;

  return (
    <section>
      <StepHeading n={step} hint="opcional">
        Aporte
      </StepHeading>
      <Shell>
        <p className="text-[14px] leading-6 text-white/50">
          Este evento acepta un aporte extra además de la entrada.
        </p>
        {suggestion !== null ? (
          <div className="mt-3">
            <button
              type="button"
              aria-pressed={suggestionPicked}
              onClick={() => onChange(suggestionPicked ? "" : String(suggestion / 100))}
              className={`h-11 rounded-[12px] border px-4 text-[15px] font-semibold transition ${
                suggestionPicked
                  ? "border-accent bg-accent text-black"
                  : "border-border bg-surface-2 text-white/85 hover:border-border-strong hover:bg-white/[0.08]"
              }`}
            >
              Aportar {formatLempiras(suggestion)}
            </button>
            <p className="mt-2 text-[12px] leading-5 text-white/35">
              Monto sugerido por el organizador. Puedes escribir otro o dejarlo en
              blanco.
            </p>
          </div>
        ) : null}
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
  rejectedMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  step: number;
  /** Tras intentar pagar con el campo vacío o mal escrito. */
  showError: boolean;
  /** La pasarela rechazó este mismo número. Se va en cuanto se edita. */
  rejectedMessage?: string | null;
}) {
  const errorId = useId();
  const errorText = showError
    ? "Escríbelo tal como aparece en el documento."
    : rejectedMessage || null;
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
            aria-invalid={errorText !== null}
            aria-describedby={errorText ? errorId : undefined}
            onChange={(event) => onChange(event.target.value)}
            className="max-w-xs tracking-[0.04em]"
          />
          {errorText ? (
            <p id={errorId} role="alert" className="mt-2 text-sm text-red-300">
              {errorText}
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
  // Closed until asked for: most buyers have no code. An applied code or a
  // pending error keeps it open so neither is hidden.
  const [open, setOpen] = useState(false);
  const expanded = open || Boolean(applied) || Boolean(error);
  return (
    <section>
      <StepHeading n={step} hint="opcional">
        Código promocional
      </StepHeading>
      {expanded ? (
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
                  autoFocus={open && !applied}
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
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          className="flex w-full items-center gap-3 rounded-[22px] border border-white/8 bg-white/3 px-4 py-3.5 text-left text-[14px] font-semibold tracking-tight text-white/70 transition hover:border-white/14 hover:bg-white/5 hover:text-white"
        >
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          ¿Tienes un código? Agrégalo
        </button>
      )}
    </section>
  );
}

/** Required checkbox when the event is part of a campaign. */
export function CampaignConsentField({
  campaigns,
  checked,
  onChange,
  showError,
}: {
  campaigns: EventCampaign[];
  checked: boolean;
  onChange: (value: boolean) => void;
  /** Tras intentar pagar sin aceptar. */
  showError: boolean;
}) {
  const errorId = useId();
  if (campaigns.length === 0) return null;
  const hubs = [...new Set(campaigns.map((c) => c.hub.name))];
  const hubLabel =
    hubs.length > 1 ? `${hubs.slice(0, -1).join(", ")} y ${hubs[hubs.length - 1]}` : hubs[0];
  return (
    <section>
      <Shell>
        <p className="text-[14px] leading-6 text-white/50">
          Este evento es parte de {campaigns.map((c) => c.name).join(", ")}. {hubLabel}{" "}
          {hubs.length > 1 ? "recibirán" : "recibirá"} el nombre de cada asistente,
          si asistió y sus respuestas, para reportar la campaña.
        </p>
        <label className="mt-3 flex cursor-pointer items-center gap-3 text-[14px] text-white">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            aria-invalid={showError && !checked}
            aria-describedby={showError && !checked ? errorId : undefined}
          />
          <span
            aria-hidden
            className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
              checked
                ? "border-white bg-white text-black"
                : showError
                  ? "border-red-300"
                  : "border-white/25"
            }`}
          >
            {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
          </span>
          Acepto compartir estos datos con {hubLabel}
        </label>
        {showError && !checked ? (
          <p id={errorId} role="alert" className="mt-2 text-sm text-red-300">
            Acepta para poder continuar.
          </p>
        ) : null}
      </Shell>
    </section>
  );
}
