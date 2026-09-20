"use client";

import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isApiError } from "@/lib/api/client";
import { getProviderDashboard, providerKeys } from "@/lib/api/provider";

/**
 * Comercio gate. The dashboard call doubles as the membership check: a 403
 * means this account manages no comercio.
 */
export function useProviderAccess() {
  const { ready } = useRequireAuth();
  const query = useQuery({
    queryKey: providerKeys.dashboard,
    queryFn: getProviderDashboard,
    enabled: ready,
    retry: false,
  });
  const forbidden = isApiError(query.error) && query.error.status === 403;
  return {
    ready,
    dashboard: query.data,
    loading: !ready || query.isLoading,
    forbidden,
    error: !forbidden ? (query.error as Error | null) : null,
    refetch: query.refetch,
  };
}
