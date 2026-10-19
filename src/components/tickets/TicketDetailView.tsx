"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatEventWhen } from "@/lib/allons-api";
import { getMyTicket, ticketKeys } from "@/lib/api/tickets";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { AnotherSessionCard } from "@/components/pay/AnotherSessionCard";
import { TicketCode } from "./TicketCode";
import { TicketMeta } from "./TicketMeta";
import { TicketQr } from "./TicketQr";
import { TicketResourceCard } from "./TicketResourceCard";

// Carnaval Rosa (FUNHOCAM) hands out kits with the code, so it reads as a delivery code.
const CODE_LABEL_BY_EVENT: Record<string, string> = {
  "a0367900-2a14-4ff0-bb9a-c2afc29e152f": "Código de entrega",
};

export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const { ready } = useRequireAuth();
  const params = useSearchParams();
  const isNew = params.get("nuevo") === "1";
  const query = useQuery({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: () => getMyTicket(ticketId),
    enabled: ready && Boolean(ticketId),
  });
  const ticket = query.data;

  if (!ready || query.isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="size-72 rounded-[28px]" />
        <Skeleton className="h-16 w-2/3" />
      </div>
    );
  }
  if (query.error || !ticket) {
    return <ErrorState message={(query.error as Error | null)?.message} onRetry={() => void query.refetch()} />;
  }

  const when = formatEventWhen(ticket.event?.startsAt ?? null);
  const eventTitle = ticket.event?.title ?? ticket.title;
  const typeName = ticket.ticketTypeName?.trim() || null;
  const showType = Boolean(typeName && typeName !== eventTitle);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/tickets"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-white/45 transition hover:text-white"
      >
        <BackMark />
        Mis tickets
      </Link>

      {isNew ? <ReadyChip /> : null}

      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">
          Tu pase
        </p>
        <h1 className="mt-2 break-words text-[26px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[36px]">
          {eventTitle}
        </h1>
        {showType ? (
          <p className="mt-2 text-[16px] font-semibold tracking-tight text-white/72">
            {typeName}
          </p>
        ) : null}
        {ticket.holderName ? (
          <p className="mt-2 text-[15px] text-white/50">{ticket.holderName}</p>
        ) : null}
        {ticket.answers?.length ? (
          <ul className="mt-5 flex flex-wrap justify-center gap-3">
            {ticket.answers.map((row) => (
              <li
                key={row.label}
                className="min-w-[160px] rounded-[20px] bg-accent-soft px-6 py-3.5 ring-1 ring-accent/45"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  {row.label}
                </p>
                <p className="mt-1 break-words text-[28px] font-bold leading-none tracking-[-0.02em] text-white">
                  {row.answer}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        {(ticket.resourceGroups ?? [])
          .filter((group) => group.assigned)
          .map((group) => (
            <div key={group.id} className="mt-5">
              <TicketResourceCard group={group} />
            </div>
          ))}
      </div>

      <TicketQr payload={ticket.qrPayload} />
      <TicketCode code={ticket.code} label={ticket.eventId ? CODE_LABEL_BY_EVENT[ticket.eventId] : undefined} />

      <TicketMeta
        when={when}
        venue={ticket.event?.venue}
        address={ticket.event?.address}
        city={ticket.event?.city}
        kitPickupInfo={ticket.kitPickupInfo}
      />

      <p className="text-center text-[13px] leading-relaxed text-white/32">
        Este ticket también está en la app de Allons con la misma cuenta.
      </p>

      {isNew && ticket.eventId ? (
        <div className="flex justify-center">
          <AnotherSessionCard eventId={ticket.eventId} ticketId={ticket.id} />
        </div>
      ) : null}
    </div>
  );
}

function ReadyChip() {
  return (
    <p
      role="status"
      className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white/6 px-2 py-1.5 pr-3.5 text-[13px] font-medium tracking-tight text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10"
    >
      <span className="grid size-6 place-items-center rounded-full bg-white text-black">
        <CheckMark />
      </span>
      Listo. Este es tu ticket.
    </p>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden>
      <path
        d="M6.5 12.2 10.2 16l7.3-8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <path
        d="M14 5.5 7.5 12 14 18.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
