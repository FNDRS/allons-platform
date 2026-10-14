import { apiFetch } from "./client";

export interface ClassCoach {
  id: string;
  name: string;
  bio: string | null;
  photoUrl: string | null;
  /** `false` once retired: kept for history, not offered for new slots. */
  active: boolean;
  /** Weekly slots that currently use this coach. */
  slotCount: number;
}

export interface ClassCoachInput {
  name: string;
  bio?: string | null;
  photoUrl?: string | null;
}

export const classCoachKeys = {
  all: ["provider", "class-coaches"] as const,
};

const base = "/provider/class-coaches";

export const listClassCoaches = () => apiFetch<ClassCoach[]>(base);

export const createClassCoach = (body: ClassCoachInput) =>
  apiFetch<ClassCoach>(base, { method: "POST", body });

/** A rename reaches every slot and program that uses the coach. */
export const updateClassCoach = (
  id: string,
  body: Partial<ClassCoachInput> & { active?: boolean },
) =>
  apiFetch<ClassCoach>(`${base}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
