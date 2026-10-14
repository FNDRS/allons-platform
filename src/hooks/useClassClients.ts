"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { classProgramErrorMessage } from "@/hooks/useProviderClassPrograms";
import {
  cancelClassMembership,
  classClientKeys,
  getClassClient,
  listClassClients,
} from "@/lib/api/classClients";
import { classFinanceKeys } from "@/lib/api/classFinance";

const SEARCH_DELAY_MS = 300;

/** The comercio's class clients, searched by name as the comercio types. */
export function useClassClients() {
  const { ready } = useProviderAccess();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: classClientKeys.list(q),
    queryFn: () => listClassClients(q),
    enabled: ready,
    placeholderData: keepPreviousData,
  });

  return {
    search,
    setSearch,
    isSearching: q.length > 0,
    clients: query.data ?? [],
    isLoading: !ready || query.isLoading,
    error: query.error ? classProgramErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

/** One client: contact, passes, memberships, guests and reservations. */
export function useClassClient(userId: string) {
  const { ready } = useProviderAccess();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: classClientKeys.detail(userId),
    queryFn: () => getClassClient(userId),
    enabled: ready && Boolean(userId),
  });

  const cancelMembership = useMutation({
    mutationFn: cancelClassMembership,
    onSuccess: () => {
      toast.success("Membresía cancelada. No se harán más cobros.");
      return Promise.all([
        client.invalidateQueries({ queryKey: classClientKeys.all }),
        client.invalidateQueries({ queryKey: classFinanceKeys.all }),
      ]);
    },
    onError: (error) => toast.error(classProgramErrorMessage(error)),
  });

  return {
    client: query.data ?? null,
    isLoading: !ready || query.isLoading,
    error: query.error ? classProgramErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
    cancelMembership: (membershipId: string) => cancelMembership.mutate(membershipId),
    cancellingId: cancelMembership.isPending ? cancelMembership.variables ?? null : null,
  };
}
