"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { isApiError } from "@/lib/api/client";
import {
  classFinanceKeys,
  downloadClassSaleReceipt,
  downloadClassSalesCsv,
  getClassFinance,
  listClassSales,
  type ClassSale,
  type DateRange,
} from "@/lib/api/classFinance";
import { daysBetween, monthEnd, monthStart, todayHN } from "@/lib/dateKeys";

const MAX_RANGE_DAYS = 366;

function financeErrorMessage(error: unknown): string {
  if (isApiError(error) && error.status === 403) {
    return "Tu rol no permite ver las finanzas. Pide acceso a quien administra el comercio.";
  }
  return error instanceof Error ? error.message : "No pudimos cargar las finanzas.";
}

/** A from/to pair, this month by default, with the API's one-year limit. */
export function useFinanceRange() {
  const [range, setRange] = useState<DateRange>(() => {
    const today = todayHN();
    return { from: monthStart(today), to: monthEnd(today) };
  });
  const span = daysBetween(range.from, range.to);
  const error =
    span < 0
      ? "La fecha final debe ser después de la inicial."
      : span >= MAX_RANGE_DAYS
        ? "Elige un periodo de un año o menos."
        : null;
  return {
    range,
    setFrom: (from: string) => setRange((current) => ({ ...current, from })),
    setTo: (to: string) => setRange((current) => ({ ...current, to })),
    error,
  };
}

/** Class revenue, memberships and credits for the range. */
export function useClassFinance(range: DateRange, valid: boolean) {
  const { ready } = useProviderAccess();
  const query = useQuery({
    queryKey: classFinanceKeys.summary(range),
    queryFn: () => getClassFinance(range),
    enabled: ready && valid,
    placeholderData: keepPreviousData,
  });
  return {
    finance: query.data ?? null,
    isLoading: !ready || query.isLoading,
    error: query.error ? financeErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

/** Every class sale in the range, with the CSV export and receipts. */
export function useClassSales(range: DateRange, valid: boolean) {
  const { ready } = useProviderAccess();
  const query = useQuery({
    queryKey: classFinanceKeys.sales(range),
    queryFn: () => listClassSales(range),
    enabled: ready && valid,
    placeholderData: keepPreviousData,
  });

  const exportCsv = useMutation({
    mutationFn: () => downloadClassSalesCsv(range),
    onError: (error) => toast.error(financeErrorMessage(error)),
  });

  const receipt = useMutation({
    mutationFn: downloadClassSaleReceipt,
    onError: (error) => toast.error(financeErrorMessage(error)),
  });

  return {
    sales: query.data ?? null,
    isLoading: !ready || query.isLoading,
    error: query.error ? financeErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
    exportCsv: () => exportCsv.mutate(),
    exporting: exportCsv.isPending,
    downloadReceipt: (sale: ClassSale) => receipt.mutate(sale),
    downloadingId: receipt.isPending ? receipt.variables?.id ?? null : null,
  };
}
