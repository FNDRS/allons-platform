import { apiFetch } from "./client";

export type ClassProgramStatus = "draft" | "published" | "archived";
export type ClassPackageKind = "drop_in" | "pack" | "unlimited";

/**
 * What cancelling a reservation gives back. `credit` returns the session to
 * the pass it came from; `none` never does. Money never moves: a package is
 * paid once and its credits are what circulate afterwards.
 */
export type ClassCancellationPolicy = "none" | "credit";

export interface ClassSessionTemplate {
  id: string;
  programId: string;
  /** 0 = domingo ... 6 = sábado. */
  weekday: number;
  /** `HH:MM:SS` from the API. */
  startTime: string;
  durationMinutes: number | null;
  capacity: number | null;
  instructorName: string | null;
  coachId: string | null;
  /** `YYYY-MM-DD`, inclusive. The slot only runs inside this range. */
  startsOn: string | null;
  endsOn: string | null;
  active: boolean;
}

export interface ClassPackage {
  id: string;
  programId: string;
  name: string;
  /** Lempiras, not cents. */
  price: number;
  credits: number | null;
  validityDays: number | null;
  kind: ClassPackageKind;
  active: boolean;
  sortOrder: number;
}

/** Counters the API attaches only on the `/provider/class-programs` routes. */
export interface ProviderClassProgramMetrics {
  soldSessions: number;
  upcomingReservations: number;
  /** Ratio 0 to 1 across past sessions, or null when none have run yet. */
  avgOccupancy: number | null;
  revenueCents: number;
}

export interface ProviderClassProgram {
  id: string;
  providerId: string;
  title: string;
  description: string | null;
  discipline: string | null;
  instructorName: string | null;
  coachId: string | null;
  durationMinutes: number;
  capacityPerSession: number;
  locationName: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  themeColor: string | null;
  status: ClassProgramStatus;
  cancellationPolicy: ClassCancellationPolicy;
  /** Hours before the session up to which cancelling still returns the credit. */
  cancellationWindowHours: number;
  createdAt: string;
  updatedAt: string;
  sessionTemplates: ClassSessionTemplate[];
  packages: ClassPackage[];
  metrics: ProviderClassProgramMetrics;
}

export interface ClassProgramInput {
  title: string;
  description?: string | null;
  instructorName?: string | null;
  coachId?: string | null;
  durationMinutes: number;
  capacityPerSession: number;
  locationName?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  coverImageUrl?: string | null;
  status: ClassProgramStatus;
  cancellationPolicy?: ClassCancellationPolicy;
  cancellationWindowHours?: number;
}

export interface ClassSessionTemplateInput {
  weekday: number;
  startTime: string;
  durationMinutes?: number | null;
  capacity?: number | null;
  instructorName?: string | null;
  coachId?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
}

export interface ClassPackageInput {
  name: string;
  price: number;
  kind: ClassPackageKind;
  credits?: number | null;
  validityDays?: number | null;
  sortOrder?: number;
}

/**
 * Create-only payload: the API inserts the program with its schedules and
 * packages in one transaction, so a program never exists without them.
 */
export interface ClassProgramCreateInput extends ClassProgramInput {
  sessionTemplates: ClassSessionTemplateInput[];
  packages: ClassPackageInput[];
}

export const providerClassProgramKeys = {
  all: ["provider", "class-programs"] as const,
  detail: (id: string) => ["provider", "class-programs", id] as const,
};

const base = "/provider/class-programs";
const programPath = (id: string) => `${base}/${encodeURIComponent(id)}`;

export const listProviderClassPrograms = () =>
  apiFetch<ProviderClassProgram[]>(base);

export const getProviderClassProgram = (id: string) =>
  apiFetch<ProviderClassProgram>(programPath(id));

export const createProviderClassProgram = (body: ClassProgramCreateInput) =>
  apiFetch<ProviderClassProgram>(base, { method: "POST", body });

export const updateProviderClassProgram = (
  id: string,
  body: Partial<ClassProgramInput>,
) => apiFetch<ProviderClassProgram>(programPath(id), { method: "PATCH", body });

export const deleteProviderClassProgram = (id: string) =>
  apiFetch<{ deleted: true }>(programPath(id), { method: "DELETE" });

export const createClassSessionTemplate = (
  programId: string,
  body: ClassSessionTemplateInput,
) =>
  apiFetch<ClassSessionTemplate>(`${programPath(programId)}/session-templates`, {
    method: "POST",
    body,
  });

export const updateClassSessionTemplate = (
  templateId: string,
  body: Partial<ClassSessionTemplateInput> & { active?: boolean },
) =>
  apiFetch<ClassSessionTemplate>(
    `/provider/class-session-templates/${encodeURIComponent(templateId)}`,
    { method: "PATCH", body },
  );

/** Soft delete on the API: the row stays, flipped to `active = false`. */
export const deleteClassSessionTemplate = (templateId: string) =>
  apiFetch<void>(
    `/provider/class-session-templates/${encodeURIComponent(templateId)}`,
    { method: "DELETE" },
  );

export const createClassPackage = (programId: string, body: ClassPackageInput) =>
  apiFetch<ClassPackage>(`${programPath(programId)}/packages`, {
    method: "POST",
    body,
  });

export const updateClassPackage = (
  packageId: string,
  body: Partial<ClassPackageInput> & { active?: boolean },
) =>
  apiFetch<ClassPackage>(
    `/provider/class-packages/${encodeURIComponent(packageId)}`,
    { method: "PATCH", body },
  );

/** Soft delete on the API: the row stays, flipped to `active = false`. */
export const deleteClassPackage = (packageId: string) =>
  apiFetch<void>(`/provider/class-packages/${encodeURIComponent(packageId)}`, {
    method: "DELETE",
  });
