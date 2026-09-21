"use client";

import { useQuery } from "@tanstack/react-query";
import { getProviderActivity, providerKeys } from "@/lib/api/provider";
import { useProviderLive } from "@/components/comercio/ProviderLive";

/**
 * The comercio's activity feed. Realtime invalidates this key as rows land,
 * so the poll below is only the fallback for a closed socket.
 */
export function useProviderActivity(enabled: boolean, limit = 12) {
  const { live } = useProviderLive();
  return useQuery({
    queryKey: providerKeys.activity,
    queryFn: () => getProviderActivity(limit),
    enabled,
    refetchInterval: live ? false : 60_000,
  });
}
