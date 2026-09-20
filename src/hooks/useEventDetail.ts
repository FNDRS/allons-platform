"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  eventKeys,
  getEvent,
  isEntryTypeOnSale,
  type EventDetail,
} from "@/lib/api/events";

export type ReserveState =
  | { kind: "open"; label: string }
  | { kind: "closed"; label: string };

export function deriveReserveState(event: EventDetail): ReserveState {
  if (event.status === "ended") return { kind: "closed", label: "Evento finalizado" };
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

export function useEventDetail(id: string) {
  const query = useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
  });
  const reserve = useMemo(
    () => (query.data ? deriveReserveState(query.data) : null),
    [query.data],
  );
  return { event: query.data, reserve, ...query };
}
