"use client";

import { Search } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { Input } from "@/components/ui/Field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { EventCard } from "./EventCard";

export function EventsBrowser() {
  const { events, cities, search, setSearch, city, setCity, isLoading, error, refetch } =
    useEvents();

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Busca por nombre o ciudad"
          className="pl-11"
          type="search"
          aria-label="Buscar eventos"
        />
      </div>

      {cities.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-[24px]" />
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
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
        active
          ? "bg-white text-black"
          : "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );
}
