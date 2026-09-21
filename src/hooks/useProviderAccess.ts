"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/app/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isApiError } from "@/lib/api/client";
import { getProviderDashboard, providerKeys } from "@/lib/api/provider";
import { isComercioUser } from "@/lib/role";

/**
 * Comercio gate. The JWT role is the same check the app uses and is enough
 * to open the section: pages start their own requests as soon as the
 * session is known instead of queueing behind a dashboard call.
 *
 * The dashboard itself is fetched only when asked for (`withDashboard`),
 * because hitting it as a client would auto-create a provider on the API.
 * A 403 from it still means the member was revoked, so it flips `forbidden`.
 */
export function useProviderAccess({
  withDashboard = false,
}: { withDashboard?: boolean } = {}) {
  const { user } = useAuth();
  const { ready: authReady } = useRequireAuth();
  const allowed = isComercioUser(user);
  const ready = authReady && allowed;
  const query = useQuery({
    queryKey: providerKeys.dashboard,
    queryFn: getProviderDashboard,
    enabled: ready && withDashboard,
    retry: false,
  });
  const forbidden =
    (authReady && !allowed) ||
    (isApiError(query.error) && query.error.status === 403);
  return {
    ready,
    dashboard: query.data,
    dashboardLoading: withDashboard && query.isLoading,
    loading: !authReady,
    forbidden,
    error: !forbidden ? (query.error as Error | null) : null,
    refetch: query.refetch,
  };
}
