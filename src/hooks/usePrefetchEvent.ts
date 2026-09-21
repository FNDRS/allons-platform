"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { eventKeys, getEvent } from "@/lib/api/events";

/**
 * Warms the event detail on intent (hover, touch, focus) so the page has its
 * data by the time the tap lands. Cheap to call repeatedly: a fresh entry
 * is not refetched.
 */
export function usePrefetchEvent() {
  const client = useQueryClient();
  return useCallback(
    (id: string) => {
      void client.prefetchQuery({
        queryKey: eventKeys.detail(id),
        queryFn: () => getEvent(id),
        staleTime: 30_000,
      });
    },
    [client],
  );
}
