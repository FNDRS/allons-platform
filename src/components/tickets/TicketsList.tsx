"use client";

import Link from "next/link";
import { useMyTickets } from "@/hooks/useMyTickets";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { TicketCard } from "./TicketCard";

export function TicketsList() {
  const { ready } = useRequireAuth();
  const { upcoming, past, isLoading, error, refetch } = useMyTickets(ready);

  if (!ready || isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes tickets"
        body="Cuando compres una entrada aparecerá aquí, y también en la app."
        action={
          <Link href="/events">
            <Button>Explorar eventos</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {upcoming.length > 0 ? (
        <section>
          <SectionTitle>Próximos</SectionTitle>
          <div className="flex flex-col gap-3">
            {upcoming.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </section>
      ) : null}
      {past.length > 0 ? (
        <section className="opacity-70">
          <SectionTitle>Pasados</SectionTitle>
          <div className="flex flex-col gap-3">
            {past.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
