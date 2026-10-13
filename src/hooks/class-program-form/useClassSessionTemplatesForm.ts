"use client";

import { useState } from "react";
import type {
  ClassSessionTemplate,
  ClassSessionTemplateInput,
} from "@/lib/api/providerClassPrograms";
import { parsePositiveInt } from "./constants";
import { useDraftPersistence } from "./useDraftPersistence";

/** A weekly slot being authored. `id` is local until the API assigns one. */
export interface ClassScheduleDraft {
  id: string;
  weekday: number;
  /** `HH:MM`, or empty until chosen. */
  startTime: string;
  /** Empty means the program's value applies. */
  durationMinutes: string;
  capacity: string;
  instructorName: string;
}

let draftSeq = 0;
const nextDraftId = () => `schedule-draft-${++draftSeq}`;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function emptyDraft(): ClassScheduleDraft {
  return {
    id: nextDraftId(),
    weekday: 1,
    startTime: "",
    durationMinutes: "",
    capacity: "",
    instructorName: "",
  };
}

/** Why a draft cannot be saved yet, or null when it is valid. */
export function classScheduleDraftError(draft: ClassScheduleDraft): string | null {
  if (!TIME_PATTERN.test(draft.startTime)) return "Elige la hora de la clase.";
  if (draft.durationMinutes && parsePositiveInt(draft.durationMinutes) === null) {
    return "La duración debe ser un número de minutos mayor a cero.";
  }
  if (draft.capacity && parsePositiveInt(draft.capacity) === null) {
    return "El cupo debe ser un número mayor a cero.";
  }
  return null;
}

/** Keeps the server id as the draft id: that is what marks a row as saved. */
function fromTemplate(template: ClassSessionTemplate): ClassScheduleDraft {
  return {
    id: template.id,
    weekday: template.weekday,
    // The API answers `HH:MM:SS`; the editor works in `HH:MM`.
    startTime: template.startTime.slice(0, 5),
    durationMinutes: template.durationMinutes == null ? "" : String(template.durationMinutes),
    capacity: template.capacity == null ? "" : String(template.capacity),
    instructorName: template.instructorName ?? "",
  };
}

function toPayload(draft: ClassScheduleDraft): ClassSessionTemplateInput {
  return {
    weekday: draft.weekday,
    startTime: draft.startTime,
    durationMinutes: parsePositiveInt(draft.durationMinutes),
    capacity: parsePositiveInt(draft.capacity),
    instructorName: draft.instructorName.trim() || null,
  };
}

/** Weekly recurring slots (horarios) of a class program, edited in a modal. */
export function useClassSessionTemplatesForm(initial: ClassSessionTemplate[] = []) {
  const [schedules, setSchedules] = useState<ClassScheduleDraft[]>(() =>
    initial.map(fromTemplate),
  );
  const [editorDraft, setEditorDraft] = useState<ClassScheduleDraft | null>(null);
  const persistence = useDraftPersistence(
    initial.map((template) => template.id),
    setSchedules,
  );

  const editorError = editorDraft ? classScheduleDraftError(editorDraft) : null;

  return {
    schedules,
    hasSchedules: schedules.length > 0,
    editorDraft,
    editorError,
    openNew: () => setEditorDraft(emptyDraft()),
    openExisting: (id: string) => {
      const found = schedules.find((item) => item.id === id);
      if (found) setEditorDraft({ ...found });
    },
    closeEditor: () => setEditorDraft(null),
    updateEditor: (patch: Partial<ClassScheduleDraft>) =>
      setEditorDraft((current) => (current ? { ...current, ...patch } : current)),
    commitEditor: () => {
      if (!editorDraft || editorError) return;
      setSchedules((current) =>
        current.some((item) => item.id === editorDraft.id)
          ? current.map((item) => (item.id === editorDraft.id ? editorDraft : item))
          : [...current, editorDraft],
      );
      setEditorDraft(null);
    },
    remove: (id: string) => setSchedules((current) => current.filter((item) => item.id !== id)),
    toPayloads: () => schedules.map(toPayload),
    markPersisted: persistence.markPersisted,
    markDeleted: persistence.markDeleted,
    toDiff: () => persistence.diff(schedules, (draft) => toPayload(draft)),
  };
}
