import { apiFetch } from "./client";
import type { EventListItem } from "./events";

/** A published campaign as anyone sees it on allonsapp.com/campanas/<slug>. */
export interface PublicCampaign {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  hub: { id: string; name: string; handle: string | null; logoUrl: string | null };
}

export const campaignKeys = {
  events: (slug: string) => ["campaigns", slug, "events"] as const,
};

/** The campaign's live public events, same cards as the main listing. */
export function listCampaignEvents(slug: string) {
  return apiFetch<EventListItem[]>(
    `/events?campaign=${encodeURIComponent(slug)}`,
    { auth: false },
  );
}
