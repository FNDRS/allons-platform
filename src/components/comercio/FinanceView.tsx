"use client";

import { useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/States";
import { CapacitySplit } from "./CapacitySplit";
import { RecentSales } from "./RecentSales";
import { RevenueByEvent } from "./RevenueByEvent";

const GROUP =
  "overflow-hidden rounded-[22px] bg-white/[0.04] ring-1 ring-inset ring-white/[0.08]";

/** One balance, then the two numbers that explain it. Reads like a wallet screen. */
export function FinanceBalances({
  available,
  soldTickets,
  net,
  loading = false,
}: {
  available: number;
  soldTickets: number;
  net: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-48" />
        <Skeleton className="h-[72px]" />
      </div>
    );
  }
  const average = soldTickets > 0 ? net / soldTickets : null;
  return (
    <div>
      <p className="text-[13px] font-medium text-white/45">Por depositar</p>
      <p className="mt-1 text-[40px] font-bold leading-none tracking-[-0.045em] tabular-nums sm:text-[52px]">
        {formatHNL(available)}
      </p>
      <p className="mt-2 text-[13px] text-white/40">Después del evento</p>
      <div className={`mt-5 grid grid-cols-2 ${GROUP}`}>
        <div className="px-4 py-3.5">
          <p className="text-[12px] font-medium text-white/40">Tickets</p>
          <p className="mt-0.5 text-[20px] font-semibold tabular-nums tracking-tight">
            {formatNumber(soldTickets)}
          </p>
        </div>
        <div className="border-l border-white/[0.08] px-4 py-3.5">
          <p className="text-[12px] font-medium text-white/40">Promedio</p>
          <p className="mt-0.5 text-[20px] font-semibold tabular-nums tracking-tight">
            {average === null ? "Sin ventas" : formatHNL(average)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FinanceView() {
  const { dashboard, dashboardLoading, ready } = useProviderAccess({
    withDashboard: true,
  });
  const { live } = useProviderLive();
  const events = useQuery({
    queryKey: providerKeys.events,
    queryFn: listProviderEvents,
    enabled: ready,
    refetchInterval: live ? false : 60_000,
  });
  const catalog = events.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <FinanceBalances
        available={dashboard?.availableBalance ?? 0}
        soldTickets={dashboard?.totals.soldTickets ?? 0}
        net={dashboard?.totals.net ?? 0}
        loading={dashboardLoading}
      />
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <RevenueByEvent events={catalog} loading={events.isLoading} />
        <CapacitySplit events={catalog} loading={events.isLoading} />
      </div>
      <RecentSales enabled={ready} />
    </div>
  );
}
