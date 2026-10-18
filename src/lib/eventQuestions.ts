import type { EventQuestionKind } from "@/lib/api/events";

/**
 * Kinds of registration-form question, with the names the allons-admin
 * builder gives them. Same eight values the API and the checkout accept.
 */
export const EVENT_QUESTION_KINDS: { value: EventQuestionKind; label: string; hint: string }[] = [
  { value: "text", label: "Texto corto", hint: "Una línea" },
  { value: "textarea", label: "Párrafo", hint: "Texto largo" },
  { value: "number", label: "Número", hint: "Solo dígitos" },
  { value: "date", label: "Fecha", hint: "Calendario" },
  { value: "select", label: "Desplegable", hint: "Elige una de la lista" },
  { value: "radio", label: "Opción única", hint: "Elige una, todas visibles" },
  { value: "checkbox", label: "Varias opciones", hint: "Puede elegir varias" },
  { value: "boolean", label: "Casilla de aceptación", hint: "Acepta o no acepta" },
];

export const MAX_EVENT_QUESTIONS = 50;
export const MAX_QUESTION_LABEL = 500;
export const MAX_QUESTION_OPTIONS = 20;

export function isEventQuestionKind(value: unknown): value is EventQuestionKind {
  return EVENT_QUESTION_KINDS.some((kind) => kind.value === value);
}

export function eventQuestionKindLabel(kind: string): string {
  return EVENT_QUESTION_KINDS.find((item) => item.value === kind)?.label ?? "Texto corto";
}

/** Kinds answered by picking from a list, so they need options. */
export function questionNeedsOptions(kind: string): boolean {
  return kind === "select" || kind === "radio" || kind === "checkbox";
}

/** Comma separated options to a clean list without repeats. */
export function parseQuestionOptions(text: string): string[] {
  return [...new Set(text.split(",").map((option) => option.trim()).filter(Boolean))];
}

/** Kinds where each option can carry its own stock, like shirt sizes. */
export function questionTakesLimits(kind: string): boolean {
  return kind === "select" || kind === "radio";
}

export const MAX_OPTION_LIMIT = 100000;

/** A typed limit: empty is no limit, null is not a valid number. */
export function parseOptionLimit(text: string): number | undefined | null {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value <= MAX_OPTION_LIMIT ? value : null;
}
