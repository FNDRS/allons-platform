"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { eventKeys, listEvents, type EventListItem } from "@/lib/api/events";

/** Public event list with client-side search and city filter. */
export function useEvents() {
  const query = useQuery({ queryKey: eventKeys.list, queryFn: listEvents });
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string | null>(null);

  const visible = useMemo(
    () => (query.data ?? []).filter((event) => event.status !== "ended"),
    [query.data],
  );

  const cities = useMemo(() => {
    const set = new Map<string, number>();
    for (const event of visible) {
      if (!event.city) continue;
      set.set(event.city, (set.get(event.city) ?? 0) + 1);
    }
    return [...set.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [visible]);

  const events = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return visible
      .filter((event) => !city || event.city === city)
      .filter(
        (event) =>
          !needle ||
          event.title.toLowerCase().includes(needle) ||
          (event.city ?? "").toLowerCase().includes(needle),
      )
      .sort(sortByStart);
  }, [visible, search, city]);

  return {
    events,
    cities,
    search,
    setSearch,
    city,
    setCity,
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
