"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivePaymentOrder, paymentKeys } from "@/lib/api/payments";

/**
 * The buyer's own checkout on this event that is still open, so the reserve
 * page can offer to resume it. The API refuses a second one while it lives.
 */
export function useActivePaymentOrder(eventId: string, enabled: boolean) {
  const query = useQuery({
    queryKey: paymentKeys.active(eventId),
    queryFn: () => getActivePaymentOrder(eventId),
    enabled: enabled && Boolean(eventId),
    staleTime: 30_000,
  });
  const order = query.data ?? null;
  // Without its link there is nothing to resume from here.
  return order?.paymentLink ? order : null;
}
