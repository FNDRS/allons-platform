"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  buyerPaysFees,
  eventKeys,
  getEventQuote,
  type EventEntryType,
  type FeeMode,
} from "@/lib/api/events";

/**
 * Price to print for a ticket type.
 *
 * `priceCents` is what the comercio listed. When the event charges the
 * service fee to the buyer, that number is short of what the card is
 * charged. The quote is the only figure that matches the charge: the
 * gateway's rate applies to the whole capture, fee included, so a flat
 * percent here would not.
 *
 * Returns null while that quote is still in flight, so the page does not
 * flash the list price first.
 */
export function useBuyerUnitPrices(
  eventId: string,
  types: EventEntryType[],
  feeMode: FeeMode | null | undefined,
) {
  const buyerPays = buyerPaysFees(feeMode);
  const samples = useMemo(() => {
    const byPrice = new Map<number, string>();
    for (const type of types) {
      if (type.priceCents > 0 && !byPrice.has(type.priceCents)) {
        byPrice.set(type.priceCents, type.id);
      }
    }
    return [...byPrice.entries()];
  }, [types]);

  const queries = useQueries({
    queries: samples.map(([, entryTypeId]) => ({
      queryKey: eventKeys.quote(eventId, entryTypeId, 1, 0, null),
      queryFn: () =>
        getEventQuote(eventId, {
          entryTypeId,
          quantity: 1,
          donationCents: 0,
        }),
      enabled: buyerPays && Boolean(eventId),
      staleTime: 60_000,
    })),
  });

  const quoted = new Map<number, number>();
  const failed = new Set<number>();
  samples.forEach(([priceCents], index) => {
    const query = queries[index];
    if (typeof query?.data?.totalCents === "number") {
      quoted.set(priceCents, query.data.totalCents);
    } else if (query?.isError) {
      failed.add(priceCents);
    }
  });

  function priceCentsFor(listCents: number): number | null {
    if (listCents <= 0) return 0;
    if (!buyerPays) return listCents;
    if (quoted.has(listCents)) return quoted.get(listCents) ?? listCents;
    if (failed.has(listCents)) return listCents;
    return null;
  }

  const resolving =
    buyerPays &&
    samples.some((_, index) => {
      const query = queries[index];
      return !query?.data && !query?.isError;
    });

  return { priceCentsFor, resolving };
}

export function cheapestListedCents(
  types: EventEntryType[],
  priceCentsFor: (listCents: number) => number | null,
): number | null {
  if (types.length === 0) return null;
  let min: number | null = null;
  for (const type of types) {
    const cents = priceCentsFor(type.priceCents);
    if (cents == null) return null;
    if (min == null || cents < min) min = cents;
  }
  return min;
}
