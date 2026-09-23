"use client";

import Link from "next/link";
import { useProviderActivity } from "@/hooks/useProviderActivity";
import { formatDateTime } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { activityExtra } from "./activityCopy";

/** The latest charges, so finanzas shows money moving and not only a balance. */
export function RecentSales({ enabled }: { enabled: boolean }) {
  const activity = useProviderActivity(enabled, 40);
  const sales = (activity.data ?? [])
    .filter((row) => row.type === "sale")
    .slice(0, 6);

  return (
    <section>
      <SectionTitle
        action={
          sales.length > 0 ? (
            <Link
              href="/comercio/actividades"
              className="text-[12px] font-semibold text-dim"
            >
              Ver todas
            </Link>
          ) : null
        }
      >
        Últimas ventas
      </SectionTitle>
      {activity.isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : activity.error ? (
        <ErrorState
          message={(activity.error as Error).message}
          onRetry={() => void activity.refetch()}
        />
      ) : sales.length === 0 ? (
        <EmptyState
          title="Sin ventas recientes"
          body="Cada cobro nuevo queda listado aquí."
          className="py-10"
        />
      ) : (
        <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03]">
          {sales.map((row) => {
            const extra = activityExtra(row);
            const when = formatDateTime(row.date);
            return (
              <li key={row.id}>
                <Link
                  href={`/comercio/actividades/${row.id}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 transition hover:bg-white/[0.03] sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold">
                      {row.message}
                    </p>
                    {when ? (
                      <p className="mt-0.5 text-[12px] text-white/40">{when}</p>
                    ) : null}
                  </div>
                  {extra ? (
                    <p className="shrink-0 text-[14px] font-semibold tabular-nums">
                      {extra.value}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
