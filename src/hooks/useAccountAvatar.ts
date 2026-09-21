"use client";

import { avatarUrlOf, displayNameOf, useAuth } from "@/components/app/AuthProvider";
import { useMyProfile } from "./useMyProfile";

/** Photo the app shows: GET /me, then session metadata. */
export function useAccountAvatar() {
  const { user } = useAuth();
  const profile = useMyProfile(Boolean(user));
  return {
    name: displayNameOf(user),
    src: profile.data?.avatarUrl ?? avatarUrlOf(user),
  };
}
