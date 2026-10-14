"use client";

import { useState } from "react";
import type {
  ClassSessionTemplate,
  ClassSessionTemplateInput,
} from "@/lib/api/providerClassPrograms";
import { weekdayOf } from "@/lib/dateKeys";
import { parsePositiveInt } from "./constants";
import { useDraftPersistence } from "./useDraftPersistence";

/** When a slot runs: every week, only between two dates, or on one date. */
export type ClassScheduleDateMode = "weekly" | "range" | "once";

/** A weekly slot being authored. `id` is local until the API assigns one. */
export interface ClassScheduleDraft {
  id: string;
  weekday: number;
  /** `HH:MM`, or empty until chosen. */
  startTime: string;
  /** Empty means the program's value applies. */
  durationMinutes: string;
  capacity: string;
  /** Empty means the program's coach applies. */
  coachId: string;
  /** Free-text instructor from before coaches existed. Kept until a coach is chosen. */
  legacyInstructor: string;
  dateMode: ClassScheduleDateMode;
  /** `YYYY-MM-DD` or empty. In `once` mode only `startsOn` is used. */
  startsOn: string;
  endsOn: string;
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
    coachId: "",
    legacyInstructor: "",
    dateMode: "weekly",
    startsOn: "",
    endsOn: "",
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
  if (draft.dateMode === "once" && !draft.startsOn) return "Elige la fecha de la clase.";
  if (draft.dateMode === "range") {
    if (!draft.startsOn && !draft.endsOn) return "Elige desde cuándo o hasta cuándo se imparte.";
    if (draft.startsOn && draft.endsOn && draft.endsOn < draft.startsOn) {
      return "La fecha final debe ser después de la inicial.";
    }
  }
  return null;
}

function dateModeOf(startsOn: string | null, endsOn: string | null): ClassScheduleDateMode {
  if (startsOn && startsOn === endsOn) return "once";
  return startsOn || endsOn ? "range" : "weekly";
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
    coachId: template.coachId ?? "",
    legacyInstructor: template.coachId ? "" : (template.instructorName ?? ""),
    dateMode: dateModeOf(template.startsOn, template.endsOn),
    startsOn: template.startsOn?.slice(0, 10) ?? "",
    endsOn: template.endsOn?.slice(0, 10) ?? "",
  };
}

/** The API's date range for the draft's mode. A one-off runs on its own weekday. */
function dateFields(draft: ClassScheduleDraft) {
  if (draft.dateMode === "once") {
    return { weekday: weekdayOf(draft.startsOn), startsOn: draft.startsOn, endsOn: draft.startsOn };
  }
  if (draft.dateMode === "range") {
    return { weekday: draft.weekday, startsOn: draft.startsOn || null, endsOn: draft.endsOn || null };
  }
  return { weekday: draft.weekday, startsOn: null, endsOn: null };
}

function toPayload(draft: ClassScheduleDraft): ClassSessionTemplateInput {
  return {
    ...dateFields(draft),
    startTime: draft.startTime,
    durationMinutes: parsePositiveInt(draft.durationMinutes),
    capacity: parsePositiveInt(draft.capacity),
    coachId: draft.coachId || null,
    // A chosen coach names the slot on the server; otherwise the old free
    // text stays as it was, or clears once the comercio removed it.
    ...(draft.coachId ? {} : { instructorName: draft.legacyInstructor.trim() || null }),
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
      setEditorDraft((current) => {
        if (!current) return current;
        const next = { ...current, ...patch };
        // Picking a coach (or "none") replaces the old free-text name.
        if ("coachId" in patch) next.legacyInstructor = "";
        // A one-off date decides the weekday, so the list shows the right day.
        if (next.dateMode === "once" && next.startsOn) next.weekday = weekdayOf(next.startsOn);
        return next;
      }),
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
