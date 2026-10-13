import { formatHNL } from "@/lib/format";

/**
 * Honduras keeps UTC-6 all year (no DST since 2006), so a fixed offset is
 * the whole conversion from a session's civil date and wall time.
 */
const HN_UTC_OFFSET_HOURS = 6;

const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Session start as an instant, from its Honduras date and `HH:MM`. */
export function classSessionStart(date: string, startTime: string): Date | null {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  const start = new Date(
    Date.UTC(year, month - 1, day, hour + HN_UTC_OFFSET_HOURS, minute, 0, 0),
  );
  return Number.isNaN(start.getTime()) ? null : start;
}

/**
 * The API's `elapsed` flag is the source of truth; the clock covers a cached
 * row that would otherwise keep a slot bookable after it started.
 */
export function isOccurrenceElapsed(
  occurrence: { date: string; startTime: string; elapsed?: boolean },
  now = Date.now(),
): boolean {
  if (occurrence.elapsed) return true;
  const start = classSessionStart(occurrence.date, occurrence.startTime);
  return start ? start.getTime() <= now : false;
}

/** "7:00 a. m." from `HH:MM`. */
export function formatClassTime(value: string): string {
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  const date = new Date(Date.UTC(2000, 0, 1, hour, minute));
  return date.toLocaleTimeString("es-HN", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * "Martes, 14 oct." from `YYYY-MM-DD`. Read field by field: `new Date` on a
 * bare date is UTC midnight and shows the day before west of Greenwich.
 */
export function formatClassDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return value;
  const label = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("es-HN", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "mar 14" for a day chip. */
export function formatClassDayChip(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(Date.UTC(y, m - 1, d, 12))
    .toLocaleDateString("es-HN", { timeZone: "UTC", weekday: "short", day: "numeric" })
    .replace(/\./g, "");
}

/** Today's civil date in Honduras, `YYYY-MM-DD`. */
export function hondurasToday(now = new Date()): string {
  const shifted = new Date(now.getTime() - HN_UTC_OFFSET_HOURS * 3600_000);
  return shifted.toISOString().slice(0, 10);
}

/** "Lun · Mié 17:30" from the active session templates. */
export function classScheduleLabel(
  templates: { weekday: number; startTime: string; active: boolean }[],
): string | null {
  const active = templates.filter((template) => template.active);
  if (active.length === 0) return null;
  const days = [...new Set(active.map((template) => template.weekday))]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAYS_SHORT[day] ?? "")
    .filter(Boolean);
  const times = [...new Set(active.map((template) => template.startTime))];
  const time = times.length === 1 ? ` ${formatClassTime(times[0])}` : "";
  return `${days.join(" · ")}${time}`;
}

/** "Gratis" or the lowest active package price, or null without packages. */
export function classFromPriceLabel(
  packages: { price: number; active: boolean }[],
): string | null {
  const prices = packages
    .filter((item) => item.active)
    .map((item) => Number(item.price))
    .filter(Number.isFinite);
  if (prices.length === 0) return null;
  const lowest = Math.min(...prices);
  return lowest <= 0 ? "Gratis" : formatHNL(lowest);
}

export function classPackagePriceLabel(price: number): string {
  const value = Number(price);
  return value <= 0 ? "Gratis" : formatHNL(value);
}

/** "5 sesiones · vence en 30 días". */
export function describeClassPackage(item: {
  credits: number | null;
  validityDays: number | null;
}): string {
  const credits =
    item.credits == null
      ? "Sesiones ilimitadas"
      : item.credits === 1
        ? "1 sesión"
        : `${item.credits} sesiones`;
  return item.validityDays ? `${credits} · vence en ${item.validityDays} días` : credits;
}

/** "3 de 5 sesiones" or "Ilimitado". */
export function describeClassBalance(balance: {
  creditsRemaining: number | null;
  creditsTotal: number | null;
}): string {
  if (balance.creditsRemaining == null) return "Sesiones ilimitadas";
  const left = balance.creditsRemaining;
  const label = left === 1 ? "1 sesión disponible" : `${left} sesiones disponibles`;
  return balance.creditsTotal != null ? `${label} de ${balance.creditsTotal}` : label;
}
