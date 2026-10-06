"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivePaymentOrder, paymentKeys } from "@/lib/api/payments";

/** While one is shown, how often to check it was not paid or closed elsewhere. */
const REFRESH_MS = 60_000;

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
    refetchInterval: (q) => (q.state.data ? REFRESH_MS : false),
  });
  const order = query.data ?? null;
  const expiresAt = order?.expiresAt ?? null;
  const { refetch } = query;

  // Ask again the moment it lapses, so the notice does not outlive the link.
  useEffect(() => {
    if (!expiresAt) return;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return;
    const timer = window.setTimeout(() => void refetch(), remaining);
    return () => window.clearTimeout(timer);
  }, [expiresAt, refetch]);

  if (!order?.paymentLink) return null;
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return null;
  return order;
}
