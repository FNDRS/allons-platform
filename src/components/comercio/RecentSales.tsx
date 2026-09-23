"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useProviderActivity } from "@/hooks/useProviderActivity";
import { formatDateTime, formatHNL } from "@/lib/format";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { activityExtra } from "./activityCopy";

const SALE_RE = /^Venta registrada:\s*(\d+)\s*ticket\(s\)\s*para\s*(.+)$/i;

function saleLine(message: string, meta: string | null) {
  const match = message.match(SALE_RE);
  const quantity = match ? Number(match[1]) : null;
  const title =
    match?.[2]?.trim() || message.replace(/^Venta registrada:\s*/, "");
  const unit = meta ? Number(meta.replace(/[^\d.]/g, "")) : NaN;
  const total =
    quantity && Number.isFinite(unit) ? formatHNL(quantity * unit) : null;
  const tickets =
    quantity === 1 ? "1 ticket" : quantity ? `${quantity} tickets` : null;
  return { title, tickets, total };
}

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
        <ul className="overflow-hidden rounded-[22px] bg-white/[0.04] ring-1 ring-inset ring-white/[0.08]">
          {sales.map((row) => {
            const extra = activityExtra(row);
            const line = saleLine(row.message, extra?.value ?? null);
            const when = formatDateTime(row.date);
            const detail = [line.tickets, when].filter(Boolean).join(" · ");
            return (
              <li
                key={row.id}
                className="border-b border-white/[0.06] last:border-b-0"
              >
                <Link
                  href={`/comercio/actividades/${row.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition active:bg-white/[0.05]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-semibold tracking-tight">
                      {line.title}
                    </p>
                    {detail ? (
                      <p className="mt-0.5 truncate text-[13px] text-white/40">
                        {detail}
                      </p>
                    ) : null}
                  </div>
                  {line.total ? (
                    <p className="shrink-0 text-[16px] font-semibold tabular-nums tracking-tight">
                      {line.total}
                    </p>
                  ) : null}
                  <ChevronRight
                    className="size-4 shrink-0 text-white/25"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
