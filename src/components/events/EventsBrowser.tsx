"use client";

import { useEvents } from "@/hooks/useEvents";
import { Hero } from "@/components/app/Hero";
import { Chip, SearchPill } from "@/components/ui/Pill";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { EventCard } from "./EventCard";

export function EventsBrowser() {
  const { events, cities, search, setSearch, city, setCity, isLoading, error, refetch } =
    useEvents();

  return (
    <div>
      <Hero
        signedInTitle={(name) => (
          <>
            Hola, {name}!
            <br />
            <span className="text-muted">¿Cuál es el plan?</span>
          </>
        )}
        guestTitle={
          <>
            Descubre tu
            <br />
            próximo evento
          </>
        }
      >
        <SearchPill
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="¿Qué plan buscas?"
          aria-label="Buscar eventos"
          className="max-w-xl"
        />
      </Hero>

      {cities.length > 1 ? (
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <Chip active={city === null} onClick={() => setCity(null)}>
            Todas
          </Chip>
          {cities.map((name) => (
            <Chip key={name} active={city === name} onClick={() => setCity(name)}>
              {name}
            </Chip>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/5]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No hay eventos por ahora"
          body={
            search || city
              ? "Prueba con otra búsqueda o quita el filtro."
              : "Cuando un comercio publique algo lo verás aquí."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <div key={event.id} className="rise" style={{ "--i": index } as React.CSSProperties}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
