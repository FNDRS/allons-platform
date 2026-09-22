"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatEventWhen } from "@/lib/allons-api";
import { getMyTicket, ticketKeys } from "@/lib/api/tickets";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ResourcePicker } from "./ResourcePicker";
import { TicketCode } from "./TicketCode";
import { TicketMeta } from "./TicketMeta";
import { TicketQr } from "./TicketQr";
import { TicketResourceCard } from "./TicketResourceCard";

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
  const [pickerGroup, setPickerGroup] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);

  useEffect(() => {
    if (!isNew || autoOpened || !ticket) return;
    const pending = ticket.resourceGroups?.find((group) => group.required && !group.assigned);
    if (pending) {
      setPickerGroup(pending.id);
      setPickerOpen(true);
    }
    setAutoOpened(true);
  }, [isNew, autoOpened, ticket]);

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
          {ticket.event?.title ?? ticket.title}
        </h1>
        {ticket.holderName ? (
          <p className="mt-2 text-[15px] text-white/50">{ticket.holderName}</p>
        ) : null}
      </div>

      <TicketQr payload={ticket.qrPayload} />
      <TicketCode code={ticket.code} />

      {(ticket.resourceGroups ?? []).map((group) => (
        <TicketResourceCard
          key={group.id}
          group={group}
          onPick={() => {
            setPickerGroup(group.id);
            setPickerOpen(true);
          }}
        />
      ))}

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

      <ResourcePicker
        ticketId={ticket.id}
        groupId={pickerGroup}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
      />
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
