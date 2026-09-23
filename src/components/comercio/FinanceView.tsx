"use client";

import { useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import { formatHNL } from "@/lib/format";
import { Skeleton } from "@/components/ui/States";
import { EventRevenueChart } from "./EventRevenueChart";
import { SeatsChart } from "./SeatsChart";

/** The one number that matters: what the comercio will be paid. */
export function FinanceBalances({
  available,
  loading = false,
}: {
  available: number;
  loading?: boolean;
}) {
  if (loading) return <Skeleton className="h-24 w-64" />;
  return (
    <div>
      <p className="text-[13px] font-medium text-white/45">Ganancias</p>
      <p className="mt-1 text-[40px] font-bold leading-none tracking-[-0.045em] tabular-nums sm:text-[52px]">
        {formatHNL(available)}
      </p>
      <p className="mt-2 text-[13px] text-white/40">Después del evento</p>
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

  return (
    <div className="flex flex-col gap-8">
      <FinanceBalances
        available={dashboard?.availableBalance ?? 0}
        loading={dashboardLoading}
      />
      <div className="grid items-start gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EventRevenueChart
            events={events.data ?? []}
            loading={events.isLoading}
            error={events.error ? (events.error as Error).message : undefined}
            onRetry={() => void events.refetch()}
          />
        </div>
        <div className="lg:col-span-2">
          <SeatsChart events={events.data ?? []} loading={events.isLoading} />
        </div>
      </div>
    </div>
  );
}
