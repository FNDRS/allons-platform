"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/app/AuthProvider";
import { getProviderProfile, providerKeys } from "@/lib/api/provider";
import { isComercioUser } from "@/lib/role";

/**
 * The name of the comercio this member works for, for the panel header.
 * Only asked for a comercio session: a `/provider/*` call from a client
 * account would auto-create a comercio on the API. Null until it loads.
 */
export function useComercioName(): string | null {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: providerKeys.profile,
    queryFn: getProviderProfile,
    enabled: isComercioUser(user),
    staleTime: 5 * 60_000,
  });
  return query.data?.name?.trim() || null;
}
