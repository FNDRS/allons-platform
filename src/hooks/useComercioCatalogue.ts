"use client";

import { useQuery } from "@tanstack/react-query";
import {
  comercioKeys,
  listComercioClassPrograms,
  listComercioEvents,
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
  };

  const upcoming = useQuery({
    queryKey: comercioKeys.events(profile.id, "upcoming"),
    queryFn: () => listComercioEvents(profile.id, "upcoming", provider),
  });
  const past = useQuery({
    queryKey: comercioKeys.events(profile.id, "past"),
    queryFn: () => listComercioEvents(profile.id, "past", provider),
  });
  const programs = useQuery({
    queryKey: comercioKeys.classPrograms(profile.id),
    queryFn: () => listComercioClassPrograms(profile.id),
    enabled: profile.classCount > 0,
  });

  return {
    upcoming: upcoming.data ?? [],
    past: past.data ?? [],
    eventsLoading: upcoming.isLoading || past.isLoading,
    eventsError: (upcoming.error ?? past.error) as Error | null,
    refetchEvents: () => {
      void upcoming.refetch();
      void past.refetch();
    },
    programs: (programs.data ?? []).filter(
      (program) => program.status === "published",
    ),
    programsLoading: profile.classCount > 0 && programs.isLoading,
  };
}
