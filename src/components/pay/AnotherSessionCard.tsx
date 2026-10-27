"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useBuyerUnitPrices } from "@/hooks/useBuyerUnitPrices";
import { useEventDetail } from "@/hooks/useEventDetail";
import {
  isBundleEvent,
  isEntryTypeOnSale,
  isEntryTypeUpcoming,
} from "@/lib/api/events";
import { getMyTicket, ticketKeys } from "@/lib/api/tickets";
import { ListedPrice } from "@/components/ui/ListedPrice";
import { sessionSubtitle } from "@/lib/sessionSubtitle";

/**
 * After buying one session of a bundle event, the others it can still buy.
 * One purchase carries one entry type, so this makes the next one a tap away.
 * Renders nothing for a single event or when no other session is for sale.
 */
export function AnotherSessionCard({
  eventId,
  ticketId,
}: {
  eventId: string;
  /** A ticket of this purchase, to leave out the session just bought. */
  ticketId: string | null;
}) {
  const { event, isPlaceholderData } = useEventDetail(eventId);
  const ticket = useQuery({
    queryKey: ticketKeys.detail(ticketId ?? ""),
    queryFn: () => getMyTicket(ticketId ?? ""),
    enabled: Boolean(ticketId),
  });
  const ready = Boolean(event) && !isPlaceholderData;
  const bundle = ready && event ? isBundleEvent(event) : false;
  const boughtTypeId = ticket.data?.ticketTypeId ?? null;
  const others = bundle
    ? (event?.entryTypes ?? []).filter(
        (type) =>
          type.id !== boughtTypeId &&
          !type.soldOut &&
          type.remaining !== 0 &&
          (isEntryTypeOnSale(type) || isEntryTypeUpcoming(type)),
      )
    : [];
  const listed = useBuyerUnitPrices(eventId, others, event?.feeMode);

  if (others.length === 0) return null;

  return (
    <section className="mt-10 w-full max-w-md text-left">
      <h2 className="text-center text-[15px] font-semibold tracking-tight text-white/90">
        ¿Quieres otra sesión?
      </h2>
      <p className="mt-1 text-center text-[13px] text-white/45">
        Cada sesión se compra por separado.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {others.map((type) => {
          const subtitle = sessionSubtitle(type);
          return (
            <li key={type.id}>
              <Link
                href={`/eventos/${encodeURIComponent(eventId)}/reservar?entrada=${encodeURIComponent(type.id)}`}
                className="flex items-center justify-between gap-4 rounded-[20px] border border-white/[0.08] bg-[#0c0c0e] px-4 py-3.5 transition hover:border-white/20"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold tracking-tight">{type.name}</p>
                  {subtitle ? (
                    <p className="mt-0.5 truncate text-[12px] text-white/50">{subtitle}</p>
                  ) : null}
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[14px] font-bold">
                  <ListedPrice cents={listed.priceCentsFor(type.priceCents)} />
                  <ChevronRight className="size-4 text-white/40" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
