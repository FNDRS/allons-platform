"use client";

import { useMemo } from "react";
import type { HubCampaign } from "@/lib/api/campaigns";
import { buildCampaignDemo } from "@/lib/campaignDemo";
import { useDemoMode } from "@/hooks/useDemoMode";

/** Example data for one campaign while the demo switch is on. */
export function useCampaignDemo(campaign: HubCampaign | undefined) {
  const { enabled, toggle } = useDemoMode();
  const data = useMemo(
    () => (enabled && campaign ? buildCampaignDemo(campaign) : null),
    [enabled, campaign],
  );
  return { enabled, toggle, data };
}
