"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/app/AuthProvider";
import { getProviderProfile, providerKeys } from "@/lib/api/provider";
import { isComercioUser } from "@/lib/role";

/**
 * Where this member's comercio lives on allonsapp.com, for the panel
 * header: `/<handle>`, or `/<id>` when it has no handle yet. Only asked for
 * a comercio session: a `/provider/*` call from a client account would
 * auto-create a comercio on the API. Null until it loads.
 */
export function useComercioPublicPage(): { href: string; label: string } | null {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: providerKeys.profile,
    queryFn: getProviderProfile,
    enabled: isComercioUser(user),
    staleTime: 5 * 60_000,
  });
  const profile = query.data;
  if (!profile) return null;
  const slug = profile.handle?.trim().replace(/^@/, "") || profile.id;
  return { href: `/${encodeURIComponent(slug)}`, label: `allonsapp.com/${slug}` };
}
