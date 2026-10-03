"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "allons:campaign-demo";

/**
 * The campaigns demo switch, shared by the list and the detail pages:
 * turning it on in one shows example data in the other. Remembered in this
 * browser only; storage failing just means it starts off. Read after mount
 * so the server render and the first client render agree.
 */
export function useDemoMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Private mode or blocked storage: the demo simply starts off.
    }
  }, []);

  const toggle = () =>
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Not remembered; the toggle still works for this visit.
      }
      return next;
    });

  return { enabled, toggle };
}
