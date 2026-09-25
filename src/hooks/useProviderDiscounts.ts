"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  createProviderDiscount,
  deleteProviderDiscount,
  listProviderDiscounts,
  providerKeys,
  updateProviderDiscount,
  type ProviderDiscountInput,
} from "@/lib/api/provider";

export function useProviderDiscounts(enabled: boolean) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: providerKeys.discounts,
    queryFn: listProviderDiscounts,
    enabled,
  });
  const refresh = () =>
    void client.invalidateQueries({ queryKey: providerKeys.discounts });
  const onError = (error: unknown) =>
    toast.error(isApiError(error) ? error.message : "No se pudo completar.");

  const create = useMutation({
    mutationFn: (input: ProviderDiscountInput) => createProviderDiscount(input),
    onSuccess: (rows) => {
      client.setQueryData(providerKeys.discounts, rows);
      toast.success("Código promocional creado");
    },
    onError,
  });

  const toggleActive = useMutation({
    mutationFn: (input: { id: string; active: boolean }) =>
      updateProviderDiscount(input.id, { active: input.active }),
    onSuccess: refresh,
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProviderDiscount(id),
    onSuccess: () => {
      toast.success("Código eliminado");
      refresh();
    },
    onError,
  });

  return { discounts: query.data ?? [], ...query, create, toggleActive, remove };
}
