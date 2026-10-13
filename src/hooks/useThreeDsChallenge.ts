"use client";

import { useCallback, useRef, useState } from "react";

export interface ThreeDsChallengeState {
  orderId: string;
  html: string;
}

/**
 * The bank's 3DS window for one order. `run` shows it and resolves when the
 * buyer is done (the bank's return page answered, or they closed it); the
 * order itself is then read from the API, never from the window.
 */
export function useThreeDsChallenge() {
  const [challenge, setChallenge] = useState<ThreeDsChallengeState | null>(null);
  const done = useRef<(() => void) | null>(null);

  const run = useCallback((orderId: string, html: string) => {
    setChallenge({ orderId, html });
    return new Promise<void>((resolve) => {
      done.current = resolve;
    });
  }, []);

  const finish = useCallback(() => {
    setChallenge(null);
    done.current?.();
    done.current = null;
  }, []);

  return { challenge, run, finish };
}
