/**
 * Civil dates as `YYYY-MM-DD` keys. All math runs in UTC so a key never
 * slides a day because of the browser's time zone.
 */

const pad = (value: number) => String(value).padStart(2, "0");

function toKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Today in Honduras (UTC-6 all year). */
export function todayHN(): string {
  return toKey(new Date(Date.now() - 6 * 60 * 60 * 1000));
}

export function addDays(key: string, days: number): string {
  const date = fromKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return toKey(date);
}

/** 0 = domingo ... 6 = sábado. */
export function weekdayOf(key: string): number {
  return fromKey(key).getUTCDay();
}

/** The Monday of the week that holds `key`. */
export function mondayOf(key: string): string {
  return addDays(key, -((weekdayOf(key) + 6) % 7));
}

export function monthStart(key: string): string {
  return `${key.slice(0, 7)}-01`;
}

export function monthEnd(key: string): string {
  const date = fromKey(monthStart(key));
  date.setUTCMonth(date.getUTCMonth() + 1);
  date.setUTCDate(0);
  return toKey(date);
}

/** Whole days from `from` to `to`. */
export function daysBetween(from: string, to: string): number {
  return Math.round((fromKey(to).getTime() - fromKey(from).getTime()) / 86_400_000);
}

/** "14 oct" or, with `withYear`, "14 oct 2026". */
export function formatDayKey(key: string, withYear = false): string {
  return fromKey(key)
    .toLocaleDateString("es-HN", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    })
    .replace(/\./g, "");
}
