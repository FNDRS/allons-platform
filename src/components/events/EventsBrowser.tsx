"use client";

import { Search } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useStairsCoverReady } from "@/components/app/StairsCover";
import { Hero } from "@/components/app/Hero";
import { SmoothInput } from "@/components/ui/SmoothInput";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { EventCard } from "./EventCard";

export function EventsBrowser() {
  const { events, search, setSearch, isLoading, error, refetch } = useEvents();
  useStairsCoverReady(!isLoading);

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
        <SmoothInput
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="¿Qué plan buscas?"
          aria-label="Buscar eventos"
          prefix={<Search className="size-4" />}
          wrapperClassName="max-w-xl !bg-[#070708] !border-white/10 focus-within:!bg-[#070708] focus-within:!border-white/20"
          className="[&::-webkit-search-cancel-button]:hidden"
        />
      </Hero>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="aspect-[4/5] w-full rounded-[32px] border border-white/10"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No hay eventos por ahora"
          body={
            search
              ? "Prueba con otra búsqueda."
              : "Cuando un comercio publique algo lo verás aquí."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
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
    </div>
  );
}
