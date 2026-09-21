"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Keep the cover at least this long so a cached load still shows the stairs. */
  minVisibleMs?: number;
  /** Lift anyway after this long so a slow API does not hold the page. */
  maxWaitMs?: number;
};

/**
 * Survives AppShell remounts. After any customer page hydrates in this tab,
 * tickets → eventos must not replay the stairs.
 */
const session = { hydrated: false };

export function markAppShellHydrated() {
  session.hydrated = true;
}

/**
 * One-shot preloader gate for a page: covered on the first eventos land in
 * this tab, released once `ready` is true (never sooner than `minVisibleMs`,
 * never later than `maxWaitMs`). Client navigations skip it.
 */
export function useStairsPreload(
  ready: boolean,
  { minVisibleMs = 360, maxWaitMs = 1400 }: Options = {},
) {
  const [show, setShow] = useState(() => !session.hydrated);
  const mountedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!show) {
      session.hydrated = true;
      return;
    }
    mountedAt.current ??= Date.now();
    const elapsed = Date.now() - mountedAt.current;
    const wait = ready
      ? Math.max(0, minVisibleMs - elapsed)
      : Math.max(0, maxWaitMs - elapsed);
    const timer = setTimeout(() => {
      session.hydrated = true;
      setShow(false);
    }, wait);
    return () => clearTimeout(timer);
  }, [maxWaitMs, minVisibleMs, ready, show]);

  return show;
}
