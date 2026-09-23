"use client";

import { useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { CapacitySplit } from "./CapacitySplit";
import { KpiTile } from "./KpiTile";
import { RecentSales } from "./RecentSales";
import { RevenueByEvent } from "./RevenueByEvent";

/** The deposit, and the two figures that explain it. */
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    );
  }
  const average = soldTickets > 0 ? net / soldTickets : null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiTile
        label="Por depositar"
        value={formatHNL(available)}
        hint="Después del evento"
      />
      <KpiTile label="Tickets vendidos" value={formatNumber(soldTickets)} />
      <KpiTile
        label="Promedio"
        value={average === null ? "Sin ventas" : formatHNL(average)}
        hint={average === null ? undefined : "Por ticket"}
      />
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
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle>Depósito</SectionTitle>
        <FinanceBalances
          available={dashboard?.availableBalance ?? 0}
          soldTickets={dashboard?.totals.soldTickets ?? 0}
          net={dashboard?.totals.net ?? 0}
          loading={dashboardLoading}
        />
      </section>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueByEvent events={catalog} loading={events.isLoading} />
        </div>
        <div className="lg:col-span-2">
          <CapacitySplit events={catalog} loading={events.isLoading} />
        </div>
      </div>
      <RecentSales enabled={ready} />
    </div>
  );
}
