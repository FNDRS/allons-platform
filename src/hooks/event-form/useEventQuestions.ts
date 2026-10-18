"use client";

import { useState } from "react";
import type { EventQuestionKind } from "@/lib/api/events";
import type {
  ProviderEventDetail,
  ProviderEventQuestion,
  ProviderEventQuestionInput,
} from "@/lib/api/provider";
import {
  MAX_EVENT_QUESTIONS,
  MAX_QUESTION_OPTIONS,
  isEventQuestionKind,
  parseOptionLimit,
  parseQuestionOptions,
  questionNeedsOptions,
  questionTakesLimits,
} from "@/lib/eventQuestions";

/**
 * A question being authored. `key` is local; `id` is the stored row, sent
 * back so the API edits it in place and the answers it holds stay.
 */
export interface EventQuestionDraft {
  key: string;
  id?: string;
  label: string;
  kind: EventQuestionKind;
  /** Comma separated, as typed, so a comma can be written mid-option. */
  optionsText: string;
  required: boolean;
  /** Each option has its own stock. Only select and radio. */
  limited: boolean;
  /** Limit per option, as typed. Empty means no limit for that option. */
  limitsText: Record<string, string>;
  /** Tickets sold or held per option, as the server last reported. */
  taken: Record<string, number>;
}

let questionSeq = 0;
const nextKey = () => `question-${++questionSeq}`;

const bySortOrder = (a: ProviderEventQuestion, b: ProviderEventQuestion) =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

function fromQuestion(question: ProviderEventQuestion): EventQuestionDraft {
  const limits = Object.entries(question.optionLimits ?? {});
  return {
    key: nextKey(),
    id: question.id,
    label: question.label,
    kind: isEventQuestionKind(question.kind) ? question.kind : "text",
    optionsText: (question.options ?? []).join(", "),
    required: question.required,
    limited: limits.length > 0,
    limitsText: Object.fromEntries(limits.map(([option, limit]) => [option, String(limit)])),
    taken: question.optionTaken ?? {},
  };
}

/** The limits to send, only for options still on the list. Null when none. */
function limitsPayload(draft: EventQuestionDraft): Record<string, number> | null {
  if (!draft.limited) return null;
  const entries = parseQuestionOptions(draft.optionsText).flatMap((option) => {
    const limit = parseOptionLimit(draft.limitsText[option] ?? "");
    return typeof limit === "number" ? [[option, limit] as const] : [];
  });
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function toPayload(drafts: EventQuestionDraft[]): ProviderEventQuestionInput[] {
  return drafts.map((draft, sortOrder) => ({
    ...(draft.id ? { id: draft.id } : {}),
    label: draft.label.trim(),
    kind: draft.kind,
    ...(questionNeedsOptions(draft.kind) ? { options: parseQuestionOptions(draft.optionsText) } : {}),
    ...(questionTakesLimits(draft.kind) ? { optionLimits: limitsPayload(draft) } : {}),
    required: draft.required,
    sortOrder,
  }));
}

/**
 * The registration form: questions buyers answer when they get a ticket.
 * Questions a campaign hub copied in are listed apart and never sent back,
 * since the API only replaces the comercio's own ones.
 */
export function useEventQuestions(event: ProviderEventDetail | null) {
  const all = event?.questions ?? [];
  const [own] = useState(() => all.filter((q) => !q.campaignQuestionId).sort(bySortOrder));
  const [campaign] = useState(() =>
    [...(event?.campaignQuestions ?? []), ...all.filter((q) => q.campaignQuestionId)].sort(
      bySortOrder,
    ),
  );

  const [enabled, setEnabled] = useState(own.length > 0);
  const [questions, setQuestions] = useState<EventQuestionDraft[]>(() => own.map(fromQuestion));
  // What the server holds, to send `questions` only when they changed. It
  // moves on each save that lands, so a retry does not resend them.
  const [baseline, setBaseline] = useState(() => JSON.stringify(toPayload(own.map(fromQuestion))));

  const payload = enabled ? toPayload(questions) : [];
  const serialized = JSON.stringify(payload);
  const changed = serialized !== baseline;

  const problems = enabled
    ? questions.flatMap((draft, index) => {
        const n = index + 1;
        const out: string[] = [];
        if (!draft.label.trim()) out.push(`el texto de la pregunta ${n} del formulario`);
        if (questionNeedsOptions(draft.kind)) {
          const count = parseQuestionOptions(draft.optionsText).length;
          if (count === 0) out.push(`las opciones de la pregunta ${n} del formulario`);
          if (count > MAX_QUESTION_OPTIONS) {
            out.push(`dejar como máximo ${MAX_QUESTION_OPTIONS} opciones en la pregunta ${n}`);
          }
        }
        if (questionTakesLimits(draft.kind) && draft.limited) {
          const bad = parseQuestionOptions(draft.optionsText).some(
            (option) => parseOptionLimit(draft.limitsText[option] ?? "") === null,
          );
          if (bad) out.push(`un límite válido por opción en la pregunta ${n}`);
        }
        return out;
      })
    : [];

  const add = () =>
    setQuestions((current) =>
      current.length >= MAX_EVENT_QUESTIONS
        ? current
        : [
            ...current,
            {
              key: nextKey(),
              label: "",
              kind: "text",
              optionsText: "",
              required: true,
              limited: false,
              limitsText: {},
              taken: {},
            },
          ],
    );

  return {
    enabled,
    setEnabled: (value: boolean) => {
      setEnabled(value);
      // Turning it on with nothing yet opens the first question to fill in.
      if (value && questions.length === 0) add();
    },
    questions,
    campaignQuestions: campaign,
    canAdd: questions.length < MAX_EVENT_QUESTIONS,
    add,
    update: (key: string, patch: Partial<EventQuestionDraft>) =>
      setQuestions((current) => current.map((q) => (q.key === key ? { ...q, ...patch } : q))),
    remove: (key: string) => setQuestions((current) => current.filter((q) => q.key !== key)),
    move: (key: string, direction: -1 | 1) =>
      setQuestions((current) => {
        const index = current.findIndex((q) => q.key === key);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= current.length) return current;
        const next = [...current];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      }),
    problems,
    /**
     * The `questions` key for the save, or undefined to leave it out. A new
     * event only sends questions it has; an existing one only a change.
     */
    payloadFor: (isNew: boolean): ProviderEventQuestionInput[] | undefined =>
      isNew ? (payload.length > 0 ? payload : undefined) : changed ? payload : undefined,
    /**
     * The save reached the server: what it sent is now the stored set. The
     * saved event, when the response has it, gives new questions their ids
     * so the next save edits them instead of making them again.
     */
    markSaved: (saved?: Pick<ProviderEventDetail, "questions"> | null) => {
      const stored = (saved?.questions ?? [])
        .filter((q) => !q.campaignQuestionId)
        .sort(bySortOrder);
      if (!enabled || stored.length !== questions.length) {
        setBaseline(serialized);
        return;
      }
      // `questions` is what this save sent. Edits typed while it ran keep
      // their text and only pick up the ids.
      const sent = questions.map((draft, index) => ({
        ...draft,
        id: stored[index].id,
        taken: stored[index].optionTaken ?? draft.taken,
      }));
      setQuestions((current) =>
        current.map((draft) => {
          const match = sent.find((q) => q.key === draft.key);
          return match ? { ...draft, id: match.id, taken: match.taken } : draft;
        }),
      );
      setBaseline(JSON.stringify(toPayload(sent)));
    },
  };
}
