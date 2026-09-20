"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listMyTickets, ticketKeys } from "@/lib/api/tickets";

export function useMyTickets(enabled: boolean) {
  const query = useQuery({
    queryKey: ticketKeys.list,
    queryFn: listMyTickets,
    enabled,
  });
  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const all = (query.data ?? []).filter((ticket) => ticket.tab !== "clases");
    const upcoming = all.filter((ticket) => {
      const starts = ticket.event?.startsAt;
      return !starts || new Date(starts).getTime() > now - 6 * 3600_000;
    });
    const past = all.filter((ticket) => !upcoming.includes(ticket));
    const byDate = (a: typeof all[number], b: typeof all[number]) =>
      (a.event?.startsAt ? new Date(a.event.startsAt).getTime() : 0) -
      (b.event?.startsAt ? new Date(b.event.startsAt).getTime() : 0);
    return { upcoming: upcoming.sort(byDate), past: past.sort(byDate).reverse() };
  }, [query.data]);
  return { upcoming, past, ...query };
}
