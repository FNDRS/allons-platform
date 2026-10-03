"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/app/AuthProvider";
import {
  campaignKeys,
  getProviderAccess,
  listComercioCampaigns,
  listHubCampaigns,
} from "@/lib/api/campaigns";
import { isComercioUser } from "@/lib/role";

/**
 * Everything the campaigns page lists: invites waiting on this comercio,
 * its own campaigns if it is a hub, and open campaigns it can join. Only for
 * a comercio session: a `/provider/*` call from a client account would
 * auto-create a comercio on the API.
 */
export function useCampaignsOverview() {
  const { user } = useAuth();
  const enabled = isComercioUser(user);
  const access = useQuery({
    queryKey: campaignKeys.access,
    queryFn: getProviderAccess,
    enabled,
  });
  const isHub = access.data?.isCampaignHub === true;
  const hub = useQuery({
    queryKey: campaignKeys.hubList,
    queryFn: listHubCampaigns,
    enabled: enabled && isHub,
  });
  const mine = useQuery({
    queryKey: campaignKeys.comercioList,
    queryFn: listComercioCampaigns,
    enabled,
  });
  const all = mine.data ?? [];
  const invites = all.filter(
    (c) => c.membership?.status === "pending" && c.membership.initiatedBy === "hub",
  );
  return {
    access,
    isHub,
    hub,
    hubCampaigns: hub.data ?? [],
    mine,
    invites,
    campaigns: all.filter((c) => !invites.includes(c)),
  };
}
