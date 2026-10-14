import { apiFetch } from "./client";
import type { ClassProgramStatus } from "./providerClassPrograms";

/** One session of the comercio's timetable on a given date. */
export interface ClassScheduleSession {
  /** `YYYY-MM-DD`. */
  date: string;
  templateId: string;
  programId: string;
  programTitle: string;
  programStatus: ClassProgramStatus;
  themeColor: string | null;
  /** `HH:MM`. */
  startTime: string;
  durationMinutes: number;
  capacity: number;
  reservedCount: number;
  coachId: string | null;
  instructorName: string | null;
  startsOn: string | null;
  endsOn: string | null;
}

export interface ClassSchedule {
  from: string;
  to: string;
  sessions: ClassScheduleSession[];
}

export const classScheduleKeys = {
  all: ["provider", "class-schedule"] as const,
  range: (from: string, days: number) =>
    ["provider", "class-schedule", from, days] as const,
};

export const getClassSchedule = (from: string, days: number) =>
  apiFetch<ClassSchedule>(
    `/provider/class-schedule?${new URLSearchParams({ from, days: String(days) })}`,
  );
