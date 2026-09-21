"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import type { EventListItem } from "@/lib/api/events";
import { formatEventWhen } from "@/lib/allons-api";
import { EventCard } from "@/components/events/EventCard";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";

type Scope = "upcoming" | "past";

/** The comercio's events: upcoming as full cards, past as a quiet list. */
export function ComercioEventsSection({
  upcoming,
  past,
  loading,
  error,
  onRetry,
}: {
  upcoming: EventListItem[];
  past: EventListItem[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  const [scope, setScope] = useState<Scope>("upcoming");
  const options = [
    { value: "upcoming" as const, label: `Próximos${upcoming.length ? ` · ${upcoming.length}` : ""}` },
    { value: "past" as const, label: `Pasados${past.length ? ` · ${past.length}` : ""}` },
  ];

  return (
    <section>
      <SectionTitle
        action={
          past.length > 0 ? (
            <Segmented value={scope} options={options} onChange={setScope} label="Eventos" />
          ) : null
        }
      >
        Eventos
      </SectionTitle>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/5] w-full rounded-[32px]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : scope === "upcoming" ? (
        upcoming.length === 0 ? (
          <EmptyState
            title="Nada programado por ahora"
            body="Sigue al comercio en la app y te avisamos cuando publique algo."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {upcoming.map((event, index) => (
              <div
                key={event.id}
                className="rise h-full w-full"
                style={{ "--i": index } as React.CSSProperties}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {past.map((event) => (
            <Link
              key={event.id}
              href={`/eventos/${encodeURIComponent(event.id)}`}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.04]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold tracking-tight text-white/85">
                  {event.title}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[13px] text-white/45">
                  {formatEventWhen(event.startsAt) ? <span>{formatEventWhen(event.startsAt)}</span> : null}
                  {event.city ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden />
                      {event.city}
                    </span>
                  ) : null}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-white/30" aria-hidden />
            </Link>
          ))}
        </Card>
      )}
    </section>
  );
}
