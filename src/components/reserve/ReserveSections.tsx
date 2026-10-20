"use client";

import { Check, Minus, Plus, User } from "lucide-react";
import { useId, useState } from "react";
import {
  allOptionsSoldOut,
  isEntryTypeOnSale,
  isSoldOutOption,
  optionLeft,
  type EventCampaign,
  type EventEntryType,
  type EventQuestion,
} from "@/lib/api/events";
import { formatCents, formatDateTime } from "@/lib/format";
import { ListedPrice } from "@/components/ui/ListedPrice";
import { sessionSubtitle } from "@/lib/sessionSubtitle";
import type { BuyerDraft, HolderDraft } from "@/hooks/useReserveForm";
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
          const details = type.description?.trim() || null;
          return (
            <div
              key={type.id}
              className="transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]"
            >
              <Shell active={active}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange(type.id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
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
                </button>
                {/* What the entry includes, written by the organizer. Opens
                    under the card once it's picked. */}
                {details ? (
                  <div
                    aria-hidden={!active}
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-3.5 whitespace-pre-line border-t border-white/10 pl-[38px] pt-3.5 text-[14px] leading-relaxed text-white/70">
                        {details}
                      </p>
                    </div>
                  </div>
                ) : null}
              </Shell>
            </div>
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
  forBuyer,
  onForBuyer,
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
  /**
   * Ticket 1 only: it is the buyer's own, so name and email come from the
   * buyer step and are not asked again. Undefined on the other tickets.
   */
  forBuyer?: boolean;
  onForBuyer?: (value: boolean) => void;
  onChange: (patch: Partial<HolderDraft>) => void;
  onAnswer: (questionId: string, value: string) => void;
}) {
  const canBeBuyers = typeof onForBuyer === "function";
  return (
    <Shell active={forBuyer === true}>
      <div className="flex flex-col gap-4 py-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14px] font-semibold tracking-tight">
            Ticket {index + 1}
            <span className="font-medium text-white/35"> · {typeName}</span>
          </p>
          {isMe || forBuyer ? <StatusPill tone="glass">Para ti</StatusPill> : null}
        </div>
        {canBeBuyers ? (
          <div
            role="radiogroup"
            aria-label="Para quién es el ticket 1"
            className="grid grid-cols-2 gap-2"
          >
            {[
              { value: true, label: "Es para mí" },
              { value: false, label: "Es para otra persona" },
            ].map((option) => {
              const selected = forBuyer === option.value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onForBuyer(option.value)}
                  className={`flex h-12 items-center justify-center rounded-[14px] border px-3 text-[14px] font-semibold transition ${
                    selected
                      ? "border-accent bg-accent text-black"
                      : "border-border bg-surface-2 text-white/85 hover:border-border-strong hover:bg-white/[0.08]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
        {forBuyer ? (
          <p className="flex items-center gap-2 text-[14px] text-white/60">
            <User className="size-4 shrink-0 text-white/40" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 truncate">
              {holder.name.trim() || "Tu nombre"}
              {holder.email.trim() ? (
                <span className="text-white/40"> · {holder.email.trim()}</span>
              ) : null}
            </span>
          </p>
        ) : (
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
        )}
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

/**
 * Who is buying, asked once. Name and email are where the ticket goes, so
 * the email is checked twice as hard: what they typed is read back under the
 * field. A signed-in buyer keeps the account's email.
 */
export function BuyerCard({
  buyer,
  errors,
  showErrors,
  emailLocked,
  emailFromAccount = false,
  questions,
  answers,
  onChange,
  onAnswer,
  signInHref,
}: {
  buyer: BuyerDraft;
  errors: { name?: string; email?: string; answers: string[] };
  showErrors: boolean;
  /** The buyer is signed in: the receipt goes to the account's email. */
  emailLocked: boolean;
  /**
   * The event asks for an account before paying and nobody is signed in
   * yet: the email comes with the account, so it is not asked here.
   */
  emailFromAccount?: boolean;
  questions: EventQuestion[];
  answers: Record<string, string>;
  onChange: (patch: Partial<BuyerDraft>) => void;
  onAnswer: (questionId: string, value: string) => void;
  /** Offered to a guest who already has an account; hidden when signed in. */
  signInHref?: string | null;
}) {
  const email = buyer.email.trim();
  // Before the sign-in on a full checkout only the comercio's questions for
  // the buyer are shown; name and email come with the account.
  if (emailFromAccount) {
    return (
      <Shell>
        <div className="flex flex-col gap-3 py-1">
          {questions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              value={answers[question.id] ?? ""}
              onChange={(value) => onAnswer(question.id, value)}
              error={
                showErrors && errors.answers.includes(question.id)
                  ? answerError(question, answers[question.id] ?? "")
                  : null
              }
            />
          ))}
        </div>
      </Shell>
    );
  }
  return (
    <Shell>
      <div className="flex flex-col gap-4 py-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <Label>Tu nombre</Label>
            <Input
              value={buyer.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="Nombre y apellido"
              autoComplete="name"
              autoCapitalize="words"
              aria-invalid={showErrors && Boolean(errors.name)}
            />
            <FieldError>{showErrors ? errors.name : null}</FieldError>
          </label>
          <label className="block">
            <Label hint={emailLocked ? "(de tu cuenta)" : undefined}>Tu correo</Label>
            <Input
              type="email"
              inputMode="email"
              value={buyer.email}
              onChange={(event) => onChange({ email: event.target.value })}
              placeholder="tu@correo.com"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              disabled={emailLocked}
              aria-invalid={showErrors && Boolean(errors.email)}
            />
            <FieldError>{showErrors ? errors.email : null}</FieldError>
          </label>
        </div>
        <p className="text-[14px] leading-6 text-white/55">
          {email && !errors.email ? (
            <>
              Tu ticket llega a <span className="font-semibold text-white">{email}</span>.
              Revisa que esté bien escrito.
            </>
          ) : (
            "A este correo te enviamos el ticket con su código QR. No necesitas crear una cuenta."
          )}
        </p>
        {questions.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4">
            {questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id] ?? ""}
                onChange={(value) => onAnswer(question.id, value)}
                error={
                  showErrors && errors.answers.includes(question.id)
                    ? answerError(question, answers[question.id] ?? "")
                    : null
                }
              />
            ))}
          </div>
        ) : null}
        {signInHref ? (
          <p className="text-[13px] text-white/40">
            ¿Ya tienes cuenta en Allons?{" "}
            <a href={signInHref} className="font-semibold text-white/70 underline underline-offset-2 hover:text-white">
              Inicia sesión
            </a>{" "}
            para ver tus compras anteriores.
          </p>
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
            const left = soldOut ? null : optionLeft(question, option);
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-disabled={soldOut}
                disabled={soldOut && !selected}
                aria-label={
                  soldOut
                    ? `${option}, agotada`
                    : left != null
                      ? `${option}, quedan ${left}`
                      : undefined
                }
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
                ) : left != null ? (
                  <span
                    className={`text-[11px] font-medium tracking-tight ${
                      selected ? "text-black/60" : "text-white/45"
                    }`}
                  >
                    quedan {left}
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
            const left = optionLeft(question, option);
            return (
              <SelectItem key={option} value={option} disabled={soldOut}>
                {soldOut
                  ? `${option} (agotada)`
                  : left != null
                    ? `${option} (quedan ${left})`
                    : option}
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
