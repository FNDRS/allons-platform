"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/app/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isApiError } from "@/lib/api/client";
import { getProviderDashboard, providerKeys } from "@/lib/api/provider";
import { isComercioUser } from "@/lib/role";

/**
 * Comercio gate. JWT role is the same check the app uses. The dashboard
 * call is only for real comercios: hitting it as a client would auto-create
 * a provider on the API.
 */
export function useProviderAccess() {
  const { user } = useAuth();
  const { ready } = useRequireAuth();
  const allowed = isComercioUser(user);
  const query = useQuery({
    queryKey: providerKeys.dashboard,
    queryFn: getProviderDashboard,
    enabled: ready && allowed,
    retry: false,
  });
  const forbidden =
    (ready && !allowed) ||
    (isApiError(query.error) && query.error.status === 403);
  return {
    ready: ready && allowed && query.isSuccess,
    dashboard: query.data,
    loading: !ready || (allowed && query.isLoading),
    forbidden,
    error: !forbidden ? (query.error as Error | null) : null,
    refetch: query.refetch,
  };
}
