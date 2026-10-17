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
  parseQuestionOptions,
  questionNeedsOptions,
} from "@/lib/eventQuestions";

/** A question being authored. `key` is local; the API recreates the rows. */
export interface EventQuestionDraft {
  key: string;
  label: string;
  kind: EventQuestionKind;
  /** Comma separated, as typed, so a comma can be written mid-option. */
  optionsText: string;
  required: boolean;
}

let questionSeq = 0;
const nextKey = () => `question-${++questionSeq}`;

const bySortOrder = (a: ProviderEventQuestion, b: ProviderEventQuestion) =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

function fromQuestion(question: ProviderEventQuestion): EventQuestionDraft {
  return {
    key: nextKey(),
    label: question.label,
    kind: isEventQuestionKind(question.kind) ? question.kind : "text",
    optionsText: (question.options ?? []).join(", "),
    required: question.required,
  };
}

function toPayload(drafts: EventQuestionDraft[]): ProviderEventQuestionInput[] {
  return drafts.map((draft, sortOrder) => ({
    label: draft.label.trim(),
    kind: draft.kind,
    ...(questionNeedsOptions(draft.kind) ? { options: parseQuestionOptions(draft.optionsText) } : {}),
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
        return out;
      })
    : [];

  const add = () =>
    setQuestions((current) =>
      current.length >= MAX_EVENT_QUESTIONS
        ? current
        : [...current, { key: nextKey(), label: "", kind: "text", optionsText: "", required: true }],
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
    /** The save reached the server: what it sent is now the stored set. */
    markSaved: () => setBaseline(serialized),
  };
}
