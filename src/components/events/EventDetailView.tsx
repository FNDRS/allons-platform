"use client";

import Link from "next/link";
import { useEventDetail } from "@/hooks/useEventDetail";
import { Button } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import {
  EntryTypesCard,
  EventDescription,
  EventHero,
  EventMeta,
  KitPickupCard,
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
        <Skeleton className="-mx-4 aspect-[4/3] rounded-none sm:mx-0 sm:aspect-[21/9] sm:rounded-[28px]" />
        <Skeleton className="h-28" />
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

  return (
    <div className="flex flex-col gap-6">
      <EventHero event={event} />
      <EventMeta event={event} />
      <EntryTypesCard types={event.entryTypes ?? []} />
      <ResourcePreviewCard groups={event.resourceGroups ?? []} />
      <KitPickupCard info={event.kitPickupInfo} />
      <EventDescription text={event.description} />
      <RefundPolicyNote event={event} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/45">
        <a href={appDeepLink} className="font-semibold text-white/70 hover:text-white">
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

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-[#050505]/90 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{event.title}</p>
            <p className="text-xs text-white/50">
              {event.entryTypes?.length ? `Desde ${cheapest(event.entryTypes)}` : ""}
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

function cheapest(types: { priceCents: number }[]) {
  const min = Math.min(...types.map((type) => type.priceCents));
  if (!Number.isFinite(min) || min <= 0) return "Gratis";
  return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(min / 100);
}
