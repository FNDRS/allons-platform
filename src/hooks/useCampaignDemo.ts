"use client";

import { useEffect, useMemo, useState } from "react";
import type { HubCampaign } from "@/lib/api/campaigns";
import { buildCampaignDemo } from "@/lib/campaignDemo";

const STORAGE_KEY = "allons:campaign-demo";

/**
 * Whether the hub is previewing a campaign with example data. Remembered in
 * this browser only, as a convenience; storage failing just means it starts
 * off. Read after mount so the server render and the first client render
 * agree.
 */
export function useCampaignDemo(campaign: HubCampaign | undefined) {
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

  const data = useMemo(
    () => (enabled && campaign ? buildCampaignDemo(campaign) : null),
    [enabled, campaign],
  );

  return { enabled, toggle, data };
}
