"use client";

import type { PublicCampaign } from "@/lib/api/campaigns";
import { useCampaignEvents } from "@/hooks/useCampaignEvents";
import { EventCard } from "@/components/events/EventCard";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { CampaignHero } from "./CampaignHero";

/** Public campaign page: who runs it, then every event taking part. */
export function CampaignPageView({ campaign }: { campaign: PublicCampaign }) {
  const { events, loading, error, refetch } = useCampaignEvents(campaign.slug);

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <CampaignHero campaign={campaign} />
      <section>
        <SectionTitle>Eventos de la campaña</SectionTitle>
        {loading ? (
          <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] w-full rounded-[32px]" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : events.length === 0 ? (
          <EmptyState
            title="Todavía no hay eventos"
            body="Los comercios de la campaña van sumando sus eventos. Vuelve pronto."
          />
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="rise h-full w-full"
                style={{ "--i": index } as React.CSSProperties}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
