"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getProviderEvent, providerKeys } from "@/lib/api/provider";

/** Warms a comercio event's detail on intent so the page opens with data. */
export function usePrefetchProviderEvent() {
  const client = useQueryClient();
  return useCallback(
    (id: string) => {
      void client.prefetchQuery({
        queryKey: providerKeys.event(id),
        queryFn: () => getProviderEvent(id),
        staleTime: 30_000,
      });
    },
    [client],
  );
}
