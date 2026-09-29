"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  comercioKeys,
  listComercioClassPrograms,
  listComercioEvents,
  splitComercioEvents,
  type ComercioProfile,
} from "@/lib/api/comercios";
import type { EventProvider } from "@/lib/api/events";

/**
 * Everything the public profile lists under the hero: upcoming and past
 * events, and the published class programs. The profile itself arrives
 * server-rendered, so only the catalogue loads on the client.
 */
export function useComercioCatalogue(profile: ComercioProfile) {
  const provider: EventProvider = {
    id: profile.id,
    name: profile.name,
    handle: profile.handle,
    logoUrl: profile.logoUrl,
    description: profile.description,
    websiteUrl: profile.websiteUrl,
    instagramUrl: profile.instagramUrl,
  };

  const events = useQuery({
    queryKey: comercioKeys.events(profile.id, "all"),
    queryFn: () => listComercioEvents(profile.id, "all", provider),
  });
  const split = useMemo(
    () => splitComercioEvents(events.data ?? []),
    [events.data],
  );
  const programs = useQuery({
    queryKey: comercioKeys.classPrograms(profile.id),
    queryFn: () => listComercioClassPrograms(profile.id),
    enabled: profile.classCount > 0,
  });

  return {
    upcoming: split.upcoming,
    past: split.past,
    eventsLoading: events.isLoading,
    eventsError: (events.error as Error | null) ?? null,
    refetchEvents: () => {
      void events.refetch();
    },
    programs: (programs.data ?? []).filter(
      (program) => program.status === "published",
    ),
    programsLoading: profile.classCount > 0 && programs.isLoading,
  };
}
