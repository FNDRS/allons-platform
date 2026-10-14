"use client";

import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SmoothInput } from "@/components/ui/SmoothInput";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useClassClients } from "@/hooks/useClassClients";
import { ClassClientRow } from "./ClassClientRow";

/** Everyone who bought or booked a class at the comercio. */
export function ClassClientsView() {
  const c = useClassClients();

  return (
    <div className="flex flex-col gap-4">
      <SmoothInput
        type="search"
        prefix={<Search className="size-4" />}
        aria-label="Buscar cliente por nombre"
        placeholder="Buscar por nombre"
        value={c.search}
        wrapperClassName="max-w-md"
        className="[&::-webkit-search-cancel-button]:hidden"
        onChange={(e) => c.setSearch(e.target.value)}
      />

      {c.isLoading ? (
        <Skeleton className="h-[320px] w-full rounded-[24px]" />
      ) : c.error ? (
        <ErrorState message={c.error} onRetry={c.refetch} />
      ) : c.clients.length === 0 ? (
        <EmptyState
          title={c.isSearching ? "Nadie con ese nombre" : "Aún no tienes clientes de clases"}
          body={
            c.isSearching
              ? "Revisa cómo está escrito o busca solo el nombre."
              : "Aquí aparece cada persona que compre un paquete o reserve una clase."
          }
        />
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {c.clients.map((client) => (
            <ClassClientRow key={client.userId} client={client} />
          ))}
        </Card>
      )}
    </div>
  );
}
