"use client";

import { useQuery } from "@tanstack/react-query";
import { campaignKeys, listCampaignEvents } from "@/lib/api/campaigns";

/** The campaign's events; the campaign itself arrives server-rendered. */
export function useCampaignEvents(slug: string) {
  const query = useQuery({
    queryKey: campaignKeys.events(slug),
    queryFn: () => listCampaignEvents(slug),
  });
  return {
    events: query.data ?? [],
    loading: query.isLoading,
    // A failed background refresh keeps the events already on screen.
    error: query.data ? null : (query.error as Error | null),
    refetch: () => void query.refetch(),
  };
}
