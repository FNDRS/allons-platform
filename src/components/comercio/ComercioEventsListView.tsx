"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SearchPill } from "@/components/ui/Pill";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { DashboardPrivacy, HideMoneyButton } from "./dashboardPrivacy";
import { ProviderEventCard } from "./ProviderEventCard";

/**
 * Every event this comercio has, newest first, with a search box. Opening one
 * goes to `/comercio/events/[id]` for that event's own finance and ticket
 * detail. There is no "crear evento" button here on purpose: for now events
 * are only created and edited from the Allons app.
 */
export function ComercioEventsListView() {
  const { ready } = useProviderAccess();
  const { live } = useProviderLive();
  const events = useQuery({
    queryKey: providerKeys.events,
    queryFn: listProviderEvents,
    enabled: ready,
    refetchInterval: live ? false : 60_000,
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
    <DashboardPrivacy>
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle
          action={
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-dim">
                {events.data ? `${sorted.length} de ${events.data.length}` : ""}
              </span>
              <HideMoneyButton />
            </div>
          }
        >
          Tus eventos
        </SectionTitle>
        <SearchPill
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar un evento"
          aria-label="Buscar un evento"
          className="mb-4"
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
    </DashboardPrivacy>
  );
}
