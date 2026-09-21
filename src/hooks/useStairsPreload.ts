"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Keep the cover at least this long so a cached load still shows the stairs. */
  minVisibleMs?: number;
  /** Reveal anyway after this long, even if the data never settles. */
  maxWaitMs?: number;
};

/**
 * One-shot preloader gate for a page: covered on mount, released once
 * `ready` is true (never sooner than `minVisibleMs`, never later than
 * `maxWaitMs`). Returns whether the preloader should still be mounted;
 * the exit animation itself belongs to the component.
 */
export function useStairsPreload(
  ready: boolean,
  { minVisibleMs = 900, maxWaitMs = 4000 }: Options = {},
) {
  const [show, setShow] = useState(true);
  const mountedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!show) return;
    mountedAt.current ??= Date.now();
    const elapsed = Date.now() - mountedAt.current;
    const wait = ready
      ? Math.max(0, minVisibleMs - elapsed)
      : Math.max(0, maxWaitMs - elapsed);
    const timer = setTimeout(() => setShow(false), wait);
    return () => clearTimeout(timer);
  }, [maxWaitMs, minVisibleMs, ready, show]);

  return show;
}
