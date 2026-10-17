"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { buttonClass } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { getProviderEvent, providerKeys } from "@/lib/api/provider";
import { EventForm } from "./EventForm";

function EditExisting({ id }: { id: string }) {
  const { ready } = useProviderAccess();
  const query = useQuery({
    queryKey: providerKeys.event(id),
    queryFn: () => getProviderEvent(id),
    enabled: ready,
    // The form seeds from this once; a background refetch would not reach it.
    refetchOnWindowFocus: false,
  });
  if (!ready || query.isLoading) {
    return <Skeleton className="h-[640px] w-full max-w-3xl rounded-[28px]" />;
  }
  if (!query.data) {
    return (
      <ErrorState
        message={
          (query.error as Error | null)?.message ??
          "Puede que ya no exista. Vuelve a la lista e inténtalo de nuevo."
        }
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (query.data.access === "collaborator") {
    return (
      <EmptyState
        title="Solo quien organiza puede editarlo"
        body={`Este evento es de ${query.data.host?.name ?? "otro comercio"}. Puedes ver sus datos, pero los cambios los hace quien lo organiza.`}
        action={
          <Link
            href={`/comercio/events/${encodeURIComponent(id)}`}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Volver al evento
          </Link>
        }
      />
    );
  }
  return <EventForm event={query.data} />;
}

/** Create an event, or edit one of the comercio's own once it has loaded. */
export function EventEditor({ id }: { id?: string }) {
  return id ? <EditExisting id={id} /> : <EventForm event={null} />;
}
