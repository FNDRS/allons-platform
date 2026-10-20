"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPaymentOrder,
  paymentKeys,
  type PaymentOrderDetail,
} from "@/lib/api/payments";

export interface ThreeDsChallengeState {
  orderId: string;
  html: string;
}

/** How often the order is read while the bank's window is open. */
const POLL_MS = 3_000;

/**
 * The bank's 3DS window for one order. `run` shows it and resolves when the
 * buyer is done; the order itself is then read from the API, never from the
 * window.
 *
 * "Done" is whichever comes first: the order leaves `pending_payment` (read
 * here while the window is open), the bank's return page reports back, or the
 * buyer closes it. The order is what counts because the bank's last page
 * tries to navigate the whole tab, which the sandbox rightly blocks, so the
 * return page may never load.
 */
export function useThreeDsChallenge() {
  const [challenge, setChallenge] = useState<ThreeDsChallengeState | null>(null);
  const done = useRef<(() => void) | null>(null);
  // A guest reads the order with its token rather than a session.
  const reader = useRef<(() => Promise<PaymentOrderDetail>) | null>(null);

  const run = useCallback(
    (
      orderId: string,
      html: string,
      fetchOrder?: () => Promise<PaymentOrderDetail>,
    ) => {
      reader.current = fetchOrder ?? null;
      setChallenge({ orderId, html });
      return new Promise<void>((resolve) => {
        done.current = resolve;
      });
    },
    [],
  );

  const finish = useCallback(() => {
    setChallenge(null);
    done.current?.();
    done.current = null;
  }, []);

  const orderId = challenge?.orderId ?? "";
  const order = useQuery({
    queryKey: paymentKeys.order(orderId),
    queryFn: () => (reader.current ? reader.current() : getPaymentOrder(orderId)),
    enabled: Boolean(challenge),
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
  });
  const settled = Boolean(challenge) && order.data != null && order.data.status !== "pending_payment";
  useEffect(() => {
    if (settled) finish();
  }, [settled, finish]);

  return { challenge, run, finish };
}
