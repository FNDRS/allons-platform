"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SearchPill } from "@/components/ui/Pill";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import {
  listProviderEvents,
  providerKeys,
  type ProviderEventListItem,
} from "@/lib/api/provider";
import {
  formatCardDay,
  formatCardTime,
  formatHNL,
  formatNumber,
} from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { KpiTile } from "./KpiTile";
import { ProviderEventCard } from "./ProviderEventCard";

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
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
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
  const sorted = [...catalog]
    .filter((event) => !needle || event.title.toLowerCase().includes(needle))
    .sort((a, b) => {
      const ta = a.startsAt ? new Date(a.startsAt).getTime() : 0;
      const tb = b.startsAt ? new Date(b.startsAt).getTime() : 0;
      return tb - ta;
    });

  return (
    <div className="flex flex-col gap-8">
      {dashboardLoading ? (
        <section>
          <SectionTitle>Totales</SectionTitle>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
        </section>
      ) : dashboard ? (
        <section>
          <SectionTitle>Totales</SectionTitle>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Tickets vendidos" value={formatNumber(sold)} />
            <KpiTile
              label="Ingresos"
              value={formatHNL(dashboard.totals.net)}
              hint="Después del evento"
            />
            <KpiTile
              label="Ocupación"
              value={
                events.isLoading
                  ? "…"
                  : occupancy === null
                    ? "Sin cupo"
                    : `${occupancy}%`
              }
              hint={
                occupancy === null
                  ? undefined
                  : `${formatNumber(soldInCapacity)} de ${formatNumber(capacity)} cupos`
              }
            />
            <KpiTile
              label="Escaneados"
              value={formatNumber(dashboard.totals.scans)}
              hint={
                sold > 0
                  ? `${Math.round((dashboard.totals.scans / sold) * 100)}% asistencia`
                  : undefined
              }
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiTile
              label="Cupos libres"
              value={
                events.isLoading
                  ? "…"
                  : capacity > 0
                    ? formatNumber(free)
                    : "Sin cupo"
              }
            />
            <KpiTile
              label="Promedio"
              value={average === null ? "Sin ventas" : formatHNL(average)}
              hint={average === null ? undefined : "Por ticket"}
            />
            <KpiTile
              label="Próximo"
              value={
                events.isLoading
                  ? "…"
                  : upcoming
                    ? (formatCardDay(upcoming.startsAt) ?? "Sin fecha")
                    : "Ninguno"
              }
              hint={
                upcoming
                  ? (formatCardTime(upcoming.startsAt) ?? undefined)
                  : undefined
              }
            />
          </div>
        </section>
      ) : null}

      <section>
        <SectionTitle
          action={
            <span className="text-[12px] font-semibold text-dim">
              {events.data ? `${sorted.length} de ${events.data.length}` : ""}
            </span>
          }
        >
          Tus eventos
        </SectionTitle>
        <SearchPill
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar un evento"
          className="mb-4 h-12"
          actionLabel="Filtrar"
        />
        {events.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[168px] w-full rounded-[24px] border border-white/10"
              />
            ))}
          </div>
        ) : events.error ? (
          <ErrorState
            message={(events.error as Error).message}
            onRetry={() => void events.refetch()}
          />
        ) : sorted.length === 0 ? (
          <EmptyState
            title={needle ? "Ningún evento coincide" : "Aún no tienes eventos"}
            body={
              needle
                ? "Prueba con otra palabra del título."
                : "Crea eventos desde la app de Allons. Aquí verás sus ventas y asistentes."
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {sorted.map((event) => (
              <ProviderEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
