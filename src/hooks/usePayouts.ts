"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPayouts, providerKeys, requestPayout } from "@/lib/api/provider";

/** Payout history plus the request action, which refreshes the balances. */
export function usePayouts(enabled: boolean) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: providerKeys.payouts,
    queryFn: listPayouts,
    enabled,
  });
  const request = useMutation({
    mutationFn: (amount: number) => requestPayout(amount),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: providerKeys.payouts });
      void client.invalidateQueries({ queryKey: providerKeys.dashboard });
      void client.invalidateQueries({ queryKey: providerKeys.activity });
    },
  });
  return { rows: query.data ?? [], query, request };
}
