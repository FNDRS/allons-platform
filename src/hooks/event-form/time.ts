/**
 * Event dates are typed as Honduras wall-clock time (UTC-6 all year, no DST)
 * and stored as ISO instants. These helpers convert both ways without
 * depending on the browser's own time zone.
 */

const HN_OFFSET_MS = 6 * 60 * 60 * 1000;
const pad = (value: number) => String(value).padStart(2, "0");

/** `YYYY-MM-DD` + `HH:mm` in Honduras time to an ISO instant, or null. */
export function hnToIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const parsed = new Date(`${date}T${time}:00-06:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** An ISO instant as Honduras `{ date: YYYY-MM-DD, time: HH:mm }`, or blanks. */
export function isoToHn(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return { date: "", time: "" };
  const local = new Date(ms - HN_OFFSET_MS);
  return {
    date: `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`,
    time: `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`,
  };
}

/** Midnight after the event's day, in Honduras time: when ticket sales must stop. */
export function endOfHnDay(date: string): number | null {
  const iso = hnToIso(date, "00:00");
  return iso ? new Date(iso).getTime() + 24 * 60 * 60 * 1000 : null;
}

/**
 * Now in Honduras time, rounded down to 5 minutes (the time picker's step),
 * as the default start of a ticket sale.
 */
export function nowHnRounded(): { date: string; time: string } {
  const step = 5 * 60 * 1000;
  return isoToHn(new Date(Math.floor(Date.now() / step) * step).toISOString());
}
