import { formatTime12 } from "@/components/ui/TimePicker";
import { formatDayKey } from "@/lib/dateKeys";
import { WEEKDAY_LABELS, WEEKDAY_OPTIONS } from "@/hooks/class-program-form/constants";
import type { ClassPackageKind, ProviderClassProgram } from "@/lib/api/providerClassPrograms";

const WEEKDAY_PLURAL: Record<number, string> = {
  0: "Domingos",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábados",
};

/** "Lunes" for one weekday, "L · X · V" for several, or "Sin horarios". */
export function scheduleSummary(program: ProviderClassProgram): string {
  const active = new Set(
    program.sessionTemplates.filter((t) => t.active).map((t) => t.weekday),
  );
  if (active.size === 0) return "Sin horarios";
  const days = WEEKDAY_OPTIONS.filter((day) => active.has(day.key));
  if (days.length === 1) return WEEKDAY_PLURAL[days[0].key];
  return days.map((day) => day.label).join(" · ");
}

/** "Lunes · 7:00 a. m." from a weekday and an `HH:MM` or `HH:MM:SS` time. */
export function slotLabel(weekday: number, startTime: string): string {
  const time = formatTime12(startTime.slice(0, 5)) || "--:--";
  return `${WEEKDAY_LABELS[weekday] ?? "Día"} · ${time}`;
}

type PackageShape = {
  kind: ClassPackageKind;
  credits: string | number | null;
  validityDays: string | number | null;
};

/** "8 sesiones · vence en 30 días", in the words a client reads. */
export function packageDetails(item: PackageShape): string {
  const parts: string[] = [];
  if (item.kind === "unlimited") parts.push("Sesiones ilimitadas");
  else if (item.kind === "pack") parts.push(`${item.credits || "?"} sesiones`);
  else parts.push("1 sesión");
  if (item.validityDays) parts.push(`vence en ${item.validityDays} días`);
  else if (item.kind !== "drop_in") parts.push("sin vencimiento");
  return parts.join(" · ");
}

/**
 * When a slot runs, besides every week: "Solo el 24 dic 2026",
 * "Del 1 dic al 31 dic 2026", "Desde 5 ene 2027" or "Hasta 31 dic 2026".
 * Null for a slot that runs every week with no end.
 */
export function slotRangeLabel(
  startsOn: string | null | undefined,
  endsOn: string | null | undefined,
): string | null {
  const from = startsOn?.slice(0, 10) || null;
  const to = endsOn?.slice(0, 10) || null;
  if (from && from === to) return `Solo el ${formatDayKey(from, true)}`;
  if (from && to) {
    const sameYear = from.slice(0, 4) === to.slice(0, 4);
    return `Del ${formatDayKey(from, !sameYear)} al ${formatDayKey(to, true)}`;
  }
  if (from) return `Desde ${formatDayKey(from, true)}`;
  if (to) return `Hasta ${formatDayKey(to, true)}`;
  return null;
}
