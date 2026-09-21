"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyProfile, meKeys } from "@/lib/api/me";

/** Same GET /me the app uses for the profile photo (Pixabot or provider). */
export function useMyProfile(enabled: boolean) {
  return useQuery({
    queryKey: meKeys.profile,
    queryFn: getMyProfile,
    enabled,
    staleTime: 60_000,
  });
}
