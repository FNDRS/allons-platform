import type { EventEntryType } from "@/lib/api/events";
import { formatDateTime } from "@/lib/format";

/** What a session row prints under its name: its own date and venue, when it has them. */
export function sessionSubtitle(type: EventEntryType): string | null {
  const parts = [formatDateTime(type.startsAt), type.venue?.trim() || null].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
