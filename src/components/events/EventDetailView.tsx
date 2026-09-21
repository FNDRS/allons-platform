"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEventDetail } from "@/hooks/useEventDetail";
import { Button } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { formatPriceCents } from "@/lib/format";
import {
  EntryTypesCard,
  EventDescription,
  EventHero,
  EventMeta,
  KitPickupCard,
  OrganizerCard,
  RefundPolicyNote,
  ResourcePreviewCard,
} from "./EventDetailSections";

export function EventDetailView({
  id,
  appDeepLink,
  appStoreLink,
  playStoreLink,
}: {
  id: string;
  appDeepLink: string;
  appStoreLink: string;
  playStoreLink: string;
}) {
  const { event, reserve, isLoading, error, refetch } = useEventDetail(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="-mx-4 aspect-[4/3] rounded-none sm:mx-0 sm:aspect-[21/9] sm:rounded-[24px]" />
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (error || !event) {
    return (
      <ErrorState
        message={
          (error as { status?: number } | null)?.status === 404
            ? "Este evento ya no está publicado."
            : (error as Error | null)?.message
        }
        onRetry={() => void refetch()}
      />
    );
  }

  const cheapest = event.entryTypes?.length
    ? Math.min(...event.entryTypes.map((type) => type.priceCents))
    : null;

  return (
    <div className="flex flex-col gap-7">
      <Link
        href="/events"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden /> Eventos
      </Link>

      <EventHero event={event} />
      <EventMeta event={event} />

      <div className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="flex flex-col gap-7">
          <EventDescription text={event.description} />
          <ResourcePreviewCard groups={event.resourceGroups ?? []} />
          <KitPickupCard info={event.kitPickupInfo} />
        </div>
        <div className="flex flex-col gap-7">
          <EntryTypesCard types={event.entryTypes ?? []} />
          <OrganizerCard event={event} />
          <RefundPolicyNote event={event} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-dim">
        <a href={appDeepLink} className="font-semibold text-muted hover:text-white">
          Abrir en la app
        </a>
        <span aria-hidden>·</span>
        <a href={appStoreLink} target="_blank" rel="noreferrer" className="hover:text-white">
          App Store
        </a>
        <a href={playStoreLink} target="_blank" rel="noreferrer" className="hover:text-white">
          Google Play
        </a>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-2 sm:px-6">
        <div className="glass mx-auto flex max-w-[1120px] items-center justify-between gap-4 rounded-[18px] border border-border-strong px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold tracking-tight">{event.title}</p>
            <p className="text-[13px] text-muted">
              {cheapest != null ? `Desde ${formatPriceCents(cheapest)}` : ""}
            </p>
          </div>
          {reserve?.kind === "open" ? (
            <Link href={`/events/${encodeURIComponent(id)}/reservar`} className="shrink-0">
              <Button size="lg">{reserve.label}</Button>
            </Link>
          ) : (
            <Button size="lg" disabled>
              {reserve?.label ?? "Reservar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
