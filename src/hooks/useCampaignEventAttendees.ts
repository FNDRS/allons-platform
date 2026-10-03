"use client";

import { useQuery } from "@tanstack/react-query";
import { campaignKeys, getHubCampaignAttendees } from "@/lib/api/campaigns";

/** The attendee list of one campaign event, read when an event is opened. */
export function useCampaignEventAttendees(campaignId: string, eventId: string | null, enabled = true) {
  return useQuery({
    queryKey: [...campaignKeys.hub(campaignId), "attendees", eventId],
    queryFn: () => getHubCampaignAttendees(campaignId, eventId ?? undefined),
    enabled: Boolean(eventId) && enabled,
  });
}
