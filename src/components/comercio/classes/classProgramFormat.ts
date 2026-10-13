import { formatTime12 } from "@/components/ui/TimePicker";
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
