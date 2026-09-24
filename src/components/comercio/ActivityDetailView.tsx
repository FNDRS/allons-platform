"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useProviderActivity } from "@/hooks/useProviderActivity";
import { formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { activityExtra, activityTypeLabel } from "./activityCopy";

export function ActivityDetailView({ activityId }: { activityId: string }) {
  const { ready } = useProviderAccess();
  const activity = useProviderActivity(ready, 120);
  const row = activity.data?.find((item) => item.id === activityId);

  if (activity.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 rounded-[24px]" />
      </div>
    );
  }
  if (activity.error) {
    return (
      <ErrorState
        message={(activity.error as Error).message}
        onRetry={() => void activity.refetch()}
      />
    );
  }
  if (!row) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <p className="text-[15px] text-white/55">No encontramos esta actividad.</p>
      </div>
    );
  }

  const extra = activityExtra(row);
  const when = formatDateTime(row.date);
  const facts = [
    { label: "Tipo", value: activityTypeLabel(row.type) },
    ...(when ? [{ label: "Cuándo", value: when }] : []),
    ...(extra && !extra.eventId ? [{ label: extra.label, value: extra.value }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <BackLink />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
          {activityTypeLabel(row.type)}
        </p>
        <h1 className="mt-2 max-w-2xl text-[26px] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
          {row.message}
        </h1>
      </div>
      <Card>
        <dl className="flex flex-col divide-y divide-white/[0.06]">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-[13px] text-white/40">{fact.label}</dt>
              <dd className="text-right text-[14px] font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
        {extra?.eventId ? (
          <Link
            href={`/comercio/events/${extra.eventId}`}
            className={`mt-4 inline-flex h-10 items-center px-4 text-[13px] ${glassCtaClass}`}
          >
            {extra.value}
          </Link>
        ) : null}
      </Card>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/comercio/actividades"
      className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-white/45 transition hover:text-white"
    >
      <ArrowLeft className="size-4" aria-hidden /> Actividades
    </Link>
  );
}
