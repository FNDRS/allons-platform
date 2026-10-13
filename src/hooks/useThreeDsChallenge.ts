"use client";

import { useCallback, useRef, useState } from "react";
import { threeDsStorageKey } from "@/lib/api/payments";

/**
 * The bank's 3DS window for one order. `run` shows it and resolves when the
 * buyer is done (the bank's return page answered, or they closed it); the
 * order itself is then read from the API, never from the window.
 */
export function useThreeDsChallenge() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const done = useRef<(() => void) | null>(null);

  const run = useCallback((id: string, html: string) => {
    try {
      window.sessionStorage.setItem(threeDsStorageKey(id), html);
    } catch {
      /* the frame shows its loading state and the buyer can close it */
    }
    setOrderId(id);
    return new Promise<void>((resolve) => {
      done.current = resolve;
    });
  }, []);

  const finish = useCallback(() => {
    setOrderId((current) => {
      if (current) {
        try {
          window.sessionStorage.removeItem(threeDsStorageKey(current));
        } catch {
          /* nothing to clear */
        }
      }
      return null;
    });
    done.current?.();
    done.current = null;
  }, []);

  return { orderId, run, finish };
}
