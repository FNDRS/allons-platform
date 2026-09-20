"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin, Package, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatEventWhen } from "@/lib/allons-api";
import { getMyTicket, ticketKeys } from "@/lib/api/tickets";
import { Card } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ResourcePicker } from "./ResourcePicker";
import { TicketCode } from "./TicketCode";
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

  // Fresh purchase with a pending required pick: open the picker right away.
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
  const place = [ticket.event?.venue, ticket.event?.address, ticket.event?.city]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <Link href="/tickets" className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white">
        <ArrowLeft className="size-4" /> Mis tickets
      </Link>

      {isNew ? (
        <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-200">
          ¡Listo! Este es tu ticket.
        </p>
      ) : null}

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Ticket</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em]">
          {ticket.event?.title ?? ticket.title}
        </h1>
        {ticket.holderName ? (
          <p className="mt-1.5 text-white/60">{ticket.holderName}</p>
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

      <Card className="flex flex-col gap-3">
        {when ? (
          <Row icon={<Calendar className="size-4" />}>{when}</Row>
        ) : null}
        {place ? <Row icon={<MapPin className="size-4" />}>{place}</Row> : null}
        {ticket.kitPickupInfo ? (
          <Row icon={<Package className="size-4" />}>
            <span className="whitespace-pre-line">{ticket.kitPickupInfo}</span>
          </Row>
        ) : null}
        <Row icon={<Undo2 className="size-4" />}>
          <span className="text-white/55">
            {ticket.refundPolicy?.eligible
              ? "Puedes cancelar desde la app y recibir reembolso según la política del evento."
              : ticket.refundPolicy?.reason || "Este ticket no admite reembolso."}
          </span>
        </Row>
      </Card>

      <p className="text-center text-xs text-white/40">
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

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-[15px]">
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <div className="min-w-0 flex-1 leading-6">{children}</div>
    </div>
  );
}
