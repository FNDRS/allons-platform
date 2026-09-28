"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import {
  listProviderEvents,
  providerKeys,
  type ProviderEventListItem,
} from "@/lib/api/provider";
import { formatCardDay, formatCardTime, formatDashboardHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { DashboardFigure } from "./DashboardFigure";
import { DashboardPrivacy, HideMoneyButton } from "./dashboardPrivacy";
import { KpiTile } from "./KpiTile";

function nextEvent(events: ProviderEventListItem[]) {
  const now = Date.now();
  return events
    .filter((event) => {
      if (!event.startsAt) return false;
      return new Date(event.startsAt).getTime() >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.startsAt as string).getTime() -
        new Date(b.startsAt as string).getTime(),
    )[0];
}

export function ComercioDashboard() {
  const { dashboard, dashboardLoading, ready } = useProviderAccess({
    withDashboard: true,
  });
  // Realtime refreshes these as sales land; the interval covers a closed socket.
  const { live } = useProviderLive();
  const events = useQuery({
    queryKey: providerKeys.events,
    queryFn: listProviderEvents,
    enabled: ready,
    refetchInterval: live ? false : 60_000,
  });
  const catalog = events.data ?? [];
  const withCapacity = catalog.filter((event) => event.capacity > 0);
  const capacity = withCapacity.reduce((sum, event) => sum + event.capacity, 0);
  const soldInCapacity = withCapacity.reduce(
    (sum, event) => sum + event.ticketsSold,
    0,
  );
  const sold = dashboard?.totals.soldTickets ?? 0;
  const free = Math.max(capacity - soldInCapacity, 0);
  const occupancy =
    capacity > 0 ? Math.round((soldInCapacity / capacity) * 100) : null;
  const average = sold > 0 ? (dashboard?.totals.net ?? 0) / sold : null;
  const upcoming = nextEvent(catalog);

  return (
    <DashboardPrivacy>
    <div className="flex flex-col gap-6">
      {dashboardLoading || dashboard ? (
        <section>
          <SectionTitle action={<HideMoneyButton />}>Totales</SectionTitle>
          {dashboardLoading || !dashboard ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
          ) : (
            <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiTile
              label="Tickets vendidos"
              value={<DashboardFigure value={formatNumber(sold)} />}
            />
            <KpiTile
              label="Ingresos"
              value={<DashboardFigure value={formatDashboardHNL(dashboard.totals.net)} secret />}
              hint="Después del evento"
            />
            <KpiTile
              label="Ocupación"
              value={
                <DashboardFigure
                  value={
                    events.isLoading
                      ? "…"
                      : occupancy === null
                        ? "Sin cupo"
                        : `${occupancy}%`
                  }
                />
              }
              hint={
                occupancy === null
                  ? undefined
                  : `${formatNumber(soldInCapacity)} de ${formatNumber(capacity)} cupos`
              }
            />
            <KpiTile
              label="Escaneados"
              value={<DashboardFigure value={formatNumber(dashboard.totals.scans)} />}
              hint={
                sold > 0
                  ? `${Math.round((dashboard.totals.scans / sold) * 100)}% asistencia`
                  : undefined
              }
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiTile
              label="Cupos libres"
              value={
                <DashboardFigure
                  value={
                    events.isLoading
                      ? "…"
                      : capacity > 0
                        ? formatNumber(free)
                        : "Sin cupo"
                  }
                />
              }
            />
            <KpiTile
              label="Promedio"
              value={
                average === null ? (
                  "Sin ventas"
                ) : (
                  <DashboardFigure value={formatDashboardHNL(average)} secret />
                )
              }
              hint={average === null ? undefined : "Por ticket"}
            />
            <KpiTile
              label="Próximo"
              value={
                <DashboardFigure
                  value={
                    events.isLoading
                      ? "…"
                      : upcoming
                        ? (formatCardDay(upcoming.startsAt) ?? "Sin fecha")
                        : "Ninguno"
                  }
                />
              }
              hint={
                upcoming
                  ? (formatCardTime(upcoming.startsAt) ?? undefined)
                  : undefined
              }
            />
          </div>
            </>
          )}
        </section>
      ) : null}

      <section>
        <SectionTitle>Tus eventos</SectionTitle>
        <Link
          href="/comercio/events"
          className={`inline-flex h-11 items-center gap-2 px-4 text-[14px] ${glassCtaClass}`}
        >
          Ver el detalle de cada evento
          <ArrowUpRight className="size-4 text-white/45" strokeWidth={1.5} aria-hidden />
        </Link>
      </section>
    </div>
    </DashboardPrivacy>
  );
}
