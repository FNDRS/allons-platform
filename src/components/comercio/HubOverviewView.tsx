"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { getHubOverview, providerKeys } from "@/lib/api/provider";
import { Card } from "@/components/ui/Card";
import { KpiTile } from "./KpiTile";
import { Skeleton, EmptyState, ErrorState } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-HN").format(value);
}

/**
 * Cross-comercio view for a Hub account: registered vs attended per event in
 * its campaign, no revenue — most of these events are never monetized.
 */
export function HubOverviewView() {
  const { ready } = useProviderAccess();
  const overview = useQuery({
    queryKey: providerKeys.hub,
    queryFn: getHubOverview,
    enabled: ready,
    // No realtime signal covers this key (the socket only invalidates the
    // signed-in provider's own dashboard/events/activity), and these rows
    // aggregate other comercios' signups, so it always polls.
    refetchInterval: 60_000,
  });

  if (overview.isLoading) return <Skeleton className="h-64" />;
  if (overview.error) {
    return (
      <ErrorState
        message={(overview.error as Error).message}
        onRetry={() => void overview.refetch()}
      />
    );
  }

  const rows = overview.data ?? [];
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sin eventos todavía"
        body="Los eventos de la semana aparecerán aquí."
      />
    );
  }

  const totalRegistered = rows.reduce((sum, row) => sum + row.registered, 0);
  const totalAttended = rows.reduce((sum, row) => sum + row.attended, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <KpiTile label="Inscritos" value={formatNumber(totalRegistered)} />
        <KpiTile label="Asistieron" value={formatNumber(totalAttended)} />
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <Card
            key={row.eventId}
            className="flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] text-white/45">
                {row.providerName}
              </p>
              <p className="truncate font-semibold">{row.eventTitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-6">
              <div className="text-right">
                <p className="text-[11px] uppercase text-white/45">
                  Inscritos
                </p>
                <p className="tabular-nums font-bold">
                  {formatNumber(row.registered)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase text-white/45">
                  Asistieron
                </p>
                <p className="tabular-nums font-bold">
                  {formatNumber(row.attended)}
                </p>
              </div>
              <Link
                href={`/events/${row.eventId}`}
                target="_blank"
                className={`flex h-9 shrink-0 items-center gap-1.5 px-4 text-[13px] ${glassCtaClass}`}
              >
                Ver evento
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
