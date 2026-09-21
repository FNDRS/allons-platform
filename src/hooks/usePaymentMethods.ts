"use client";

import { useQuery } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/client";
import {
  listPaymentMethods,
  paymentMethodKeys,
  type PaymentMethod,
} from "@/lib/api/paymentMethods";

/**
 * The buyer's saved cards. A 503 means the deployment has saved cards
 * switched off, which is not an error to show: the checkout simply falls
 * back to the hosted Paygate page.
 */
export function usePaymentMethods({
  userId,
  enabled,
}: {
  userId: string | null;
  enabled: boolean;
}) {
  const query = useQuery({
    queryKey: paymentMethodKeys.list(userId ?? ""),
    queryFn: listPaymentMethods,
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
    retry: (count, error) =>
      count < 2 && !(isApiError(error) && error.status === 503),
  });

  const disabled = isApiError(query.error) && query.error.status === 503;
  const cards: PaymentMethod[] = query.data?.data ?? [];

  return {
    cards,
    enrollmentEnabled: query.data?.enrollmentEnabled ?? false,
    needsIdNumber: query.data?.needsIdNumber ?? true,
    /** False while loading, when disabled, or when the list itself failed. */
    available: Boolean(query.data),
    disabled,
    loading: enabled && Boolean(userId) && query.isPending,
    refetch: query.refetch,
  };
}
