"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SearchPill } from "@/components/ui/Pill";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import { formatHNL, formatNumber } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { KpiTile } from "./KpiTile";
import { ProviderEventCard } from "./ProviderEventCard";

export function ComercioDashboard() {
  const { dashboard, ready } = useProviderAccess();
  const events = useQuery({
    queryKey: providerKeys.events,
    queryFn: listProviderEvents,
    enabled: ready,
  });

  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const sorted = [...(events.data ?? [])]
    .filter((event) => !needle || event.title.toLowerCase().includes(needle))
    .sort((a, b) => {
    const ta = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const tb = b.startsAt ? new Date(b.startsAt).getTime() : 0;
      return tb - ta;
    });

  return (
    <div className="flex flex-col gap-8">
      {dashboard ? (
        <section>
          <SectionTitle>Totales</SectionTitle>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Tickets vendidos" value={formatNumber(dashboard.totals.soldTickets)} />
            <KpiTile label="Ventas brutas" value={formatHNL(dashboard.totals.gross)} />
            <KpiTile label="Neto" value={formatHNL(dashboard.totals.net)} hint="Después de comisiones" />
            <KpiTile label="Escaneados" value={formatNumber(dashboard.totals.scans)} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <KpiTile label="Disponible" value={formatHNL(dashboard.availableBalance)} />
            <KpiTile label="Pendiente" value={formatHNL(dashboard.pendingBalance)} />
            <KpiTile label="Retenido" value={formatHNL(dashboard.heldBalance)} hint="Ventana de reembolso" />
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
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        ) : events.error ? (
          <ErrorState message={(events.error as Error).message} onRetry={() => void events.refetch()} />
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
          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map((event) => (
              <ProviderEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
