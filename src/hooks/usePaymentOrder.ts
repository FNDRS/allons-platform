"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPaymentOrder, paymentKeys } from "@/lib/api/payments";

const POLL_MS = 3_000;
const MAX_POLL_MS = 3 * 60_000;
/** After `paid`, tickets are minted asynchronously; give the worker a moment. */
const MINTING_GRACE_MS = 45_000;

export type PayPhase =
  | "loading"
  | "waiting"
  | "still_pending"
  | "minting"
  | "paid"
  | "failed"
  | "error";

/**
 * Polls the order until it is terminal. Paygate has no return URL, so the
 * buyer pays in another tab and this one watches the order.
 */
export function usePaymentOrder(orderId: string) {
  const [pollingSince, setPollingSince] = useState(() => Date.now());
  const [paidSince, setPaidSince] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const paidRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: paymentKeys.order(orderId),
    queryFn: () => getPaymentOrder(orderId),
    enabled: Boolean(orderId),
    refetchInterval: (state) => {
      const data = state.state.data;
      if (!data) return POLL_MS;
      if (data.status === "pending_payment") {
        return Date.now() - pollingSince > MAX_POLL_MS ? false : POLL_MS;
      }
      if (data.status === "paid" && data.ticketIds.length === 0) {
        const since = paidRef.current ?? Date.now();
        return Date.now() - since > MINTING_GRACE_MS ? false : POLL_MS;
      }
      return false;
    },
  });

  const data = query.data;

  useEffect(() => {
    if (data?.status === "paid" && paidRef.current === null) {
      paidRef.current = Date.now();
      setPaidSince(paidRef.current);
    }
  }, [data?.status]);

  useEffect(() => {
    if (!data || data.status !== "pending_payment") return;
    const remaining = MAX_POLL_MS - (Date.now() - pollingSince);
    if (remaining <= 0) {
      setTimedOut(true);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), remaining);
    return () => clearTimeout(timer);
  }, [data, pollingSince]);

  const resume = useCallback(() => {
    setTimedOut(false);
    setPollingSince(Date.now());
    void query.refetch();
  }, [query]);

  let phase: PayPhase = "loading";
  if (query.error) phase = "error";
  else if (data) {
    if (data.status === "pending_payment") phase = timedOut ? "still_pending" : "waiting";
    else if (data.status === "paid")
      phase = data.ticketIds.length > 0 ? "paid" : "minting";
    else phase = "failed";
  }

  return {
    order: data,
    phase,
    paidSince,
    error: query.error as Error | null,
    resume,
  };
}
