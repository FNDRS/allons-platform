"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  eventKeys,
  getEvent,
  isEntryTypeOnSale,
  type EventDetail,
  type EventListItem,
} from "@/lib/api/events";

export type ReserveState =
  | { kind: "open"; label: string }
  | { kind: "closed"; label: string };

export function deriveReserveState(event: EventDetail): ReserveState {
  if (event.status === "ended") return { kind: "closed", label: "Evento finalizado" };
  if (event.status === "sold_out") return { kind: "closed", label: "Agotado" };
  const types = event.entryTypes ?? [];
  if (types.length === 0) {
    return { kind: "closed", label: "Reservas no disponibles" };
  }
  const now = Date.now();
  const onSale = types.filter((type) => isEntryTypeOnSale(type, now));
  if (onSale.length === 0) return { kind: "closed", label: "Reservas cerradas" };
  if (onSale.every((type) => type.soldOut || type.remaining === 0)) {
    return { kind: "closed", label: "Agotado" };
  }
  return { kind: "open", label: "Reservar" };
}

/** What the list already knows, shaped as a detail so the hero can paint now. */
function detailFromListItem(item: EventListItem): EventDetail {
  return {
    ...item,
    description: null,
    venue: null,
    address: null,
    latitude: null,
    longitude: null,
    provider: item.provider ?? null,
    entryTypes: [],
    questions: [],
  };
}

/**
 * Event detail. While the real response is in flight it hands back the list
 * card's data as a placeholder (`isPlaceholderData`), so opening an event
 * from the list shows title, cover and date immediately; callers keep the
 * sections that need entry types behind that flag.
 */
export function useEventDetail(id: string) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
    placeholderData: () => {
      const item = client
        .getQueryData<EventListItem[]>(eventKeys.list)
        ?.find((event) => event.id === id);
      return item ? detailFromListItem(item) : undefined;
    },
  });
  const reserve = useMemo(
    () =>
      query.data && !query.isPlaceholderData
        ? deriveReserveState(query.data)
        : null,
    [query.data, query.isPlaceholderData],
  );
  return { event: query.data, reserve, ...query };
}
