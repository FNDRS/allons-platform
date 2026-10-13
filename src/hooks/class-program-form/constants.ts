import type {
  ClassPackageKind,
  ClassProgramStatus,
} from "@/lib/api/providerClassPrograms";

/** `class_session_templates.weekday`: 0 = domingo, 1 = lunes ... 6 = sábado. */
export const WEEKDAY_OPTIONS: { key: number; label: string }[] = [
  { key: 1, label: "L" },
  { key: 2, label: "M" },
  { key: 3, label: "X" },
  { key: 4, label: "J" },
  { key: 5, label: "V" },
  { key: 6, label: "S" },
  { key: 0, label: "D" },
];

export const WEEKDAY_LABELS: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const CLASS_PACKAGE_KINDS: ClassPackageKind[] = ["drop_in", "pack", "unlimited"];

export const CLASS_PACKAGE_KIND_LABELS: Record<ClassPackageKind, string> = {
  drop_in: "Entrada por clase",
  pack: "Paquete de clases",
  unlimited: "Pase ilimitado",
};

export const CLASS_PACKAGE_KIND_HINTS: Record<ClassPackageKind, string> = {
  drop_in: "Una sola sesión, sin vencimiento.",
  pack: "Varias sesiones con un precio por paquete.",
  unlimited: "Sesiones sin límite durante un periodo.",
};

export const CLASS_PROGRAM_STATUS_LABELS: Record<ClassProgramStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

/** Digits only, as a positive integer, or null when empty or zero. */
export function parsePositiveInt(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}
