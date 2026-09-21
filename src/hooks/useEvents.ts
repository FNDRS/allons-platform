"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { eventKeys, listEvents, type EventListItem } from "@/lib/api/events";

/** Public event list with client-side search. */
export function useEvents() {
  const query = useQuery({ queryKey: eventKeys.list, queryFn: listEvents });
  const [search, setSearch] = useState("");

  const visible = useMemo(
    () => (query.data ?? []).filter((event) => event.status !== "ended"),
    [query.data],
  );

  const events = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return visible
      .filter(
        (event) =>
          !needle ||
          event.title.toLowerCase().includes(needle) ||
          (event.city ?? "").toLowerCase().includes(needle),
      )
      .sort(sortByStart);
  }, [visible, search]);

  return {
    events,
    search,
    setSearch,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

function sortByStart(a: EventListItem, b: EventListItem) {
  const ta = a.startsAt ? new Date(a.startsAt).getTime() : Infinity;
  const tb = b.startsAt ? new Date(b.startsAt).getTime() : Infinity;
  return ta - tb;
}
