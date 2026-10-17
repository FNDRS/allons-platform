"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/app/AuthProvider";
import { buttonClass } from "@/components/ui/Button";
import { SearchPill } from "@/components/ui/Pill";
import { canManageEvents } from "@/lib/role";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderLive } from "./ProviderLive";
import { listProviderEvents, providerKeys } from "@/lib/api/provider";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { DashboardPrivacy } from "./dashboardPrivacy";
import { ProviderEventCard } from "./ProviderEventCard";

const NEW_HREF = "/comercio/events/nueva";

/**
 * Every event this comercio has, newest first, with a search box and, for
 * the members who can manage events, a way to create one. New events go to
 * Allons' review before they are published.
 */
export function ComercioEventsListView({
  basePath = "/comercio/events",
  showCreate = false,
}: {
  /** Where a card opens: the event's own config, or its Finanzas detail. */
  basePath?: string;
  /** Offer "Crear evento" (the Eventos page, not Finanzas). */
  showCreate?: boolean;
}) {
  const { ready } = useProviderAccess();
  const { user } = useAuth();
  const canCreate = showCreate && canManageEvents(user);
  const createLink = (
    <Link href={NEW_HREF} className={buttonClass({ size: "sm" })}>
      <Plus className="size-4" aria-hidden />
      Crear evento
    </Link>
  );
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchPill
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar un evento"
            aria-label="Buscar un evento"
            className="min-w-0 flex-1"
            actionLabel="Filtrar"
          />
          {canCreate ? createLink : null}
        </div>
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
                : canCreate
                  ? "Crea tu primer evento aquí o desde la app de Allons. Lo revisamos antes de publicarlo y aquí verás sus ventas y asistentes."
                  : "Aquí verás las ventas y asistentes de los eventos de tu comercio."
            }
            action={!needle && canCreate ? createLink : undefined}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {sorted.map((event) => (
              <ProviderEventCard key={event.id} event={event} basePath={basePath} />
            ))}
          </div>
        )}
      </section>
    </div>
    </DashboardPrivacy>
  );
}
