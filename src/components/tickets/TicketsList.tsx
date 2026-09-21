"use client";

import Link from "next/link";
import { useMyTickets } from "@/hooks/useMyTickets";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Hero } from "@/components/app/Hero";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { TicketCard } from "./TicketCard";

export function TicketsList() {
  const { ready } = useRequireAuth();
  const { upcoming, past, isLoading, error, refetch } = useMyTickets(ready);

  return (
    <div>
      <Hero
        signedInTitle={(name) => (
          <>
            Tus tickets,
            <br />
            <span className="text-muted">{name}</span>
          </>
        )}
        guestTitle="Tus tickets"
        body="Muestra el QR o dicta el código en la entrada. También están en la app."
      />

      {!ready || isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
      ) : upcoming.length === 0 && past.length === 0 ? (
        <EmptyState
          title="Aún no tienes tickets"
          body="Cuando compres una entrada aparecerá aquí, y también en la app."
          action={
            <Link href="/eventos">
              <Button>Explorar eventos</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {upcoming.length > 0 ? (
            <section>
              <SectionTitle>Próximos</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                {upcoming.map((ticket, index) => (
                  <div key={ticket.id} className="rise" style={{ "--i": index } as React.CSSProperties}>
                    <TicketCard ticket={ticket} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {past.length > 0 ? (
            <section className="opacity-70">
              <SectionTitle>Pasados</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                {past.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
