"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check, Mail } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/States";
import { TicketCode } from "@/components/tickets/TicketCode";
import { TicketQr } from "@/components/tickets/TicketQr";
import { formatCents } from "@/lib/format";
import { getGuestTicket, guestKeys, type GuestOrderDetail } from "@/lib/api/guest";

/**
 * What a guest sees once the payment lands: the QR right here, the mail it
 * also went to, and a way to keep it in an account later. Nothing on this
 * page asks them to sign in first.
 */
export function GuestTicketsPanel({
  order,
  eventId,
}: {
  order: GuestOrderDetail;
  eventId: string | null;
}) {
  const tickets = (order.tickets ?? []).filter(
    (ticket): ticket is { id: string; key: string } => Boolean(ticket.key),
  );
  const many = tickets.length > 1;
  return (
    <div className="flex flex-col items-center px-2 py-8 text-center sm:py-12">
      <span className="flex size-14 items-center justify-center rounded-[18px] bg-white/[0.04] ring-1 ring-white/12">
        <Check className="size-6 text-white/80" strokeWidth={1.6} aria-hidden />
      </span>
      <h1 className="mt-8 break-words text-[28px] font-bold tracking-[-0.04em] sm:text-[34px]">
        ¡Listo! {many ? "Aquí están tus tickets" : "Aquí está tu ticket"}
      </h1>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-white/55">
        Pagaste {formatCents(order.amountCents)}.{" "}
        {order.buyerEmail ? (
          <>
            También {many ? "los" : "lo"} enviamos a{" "}
            <span className="font-semibold text-white">{order.buyerEmail}</span>.
          </>
        ) : (
          <>También {many ? "los" : "lo"} enviamos a tu correo.</>
        )}
      </p>

      <div className="mt-8 flex w-full flex-col gap-8">
        {tickets.map((ticket, index) => (
          <GuestTicket
            key={ticket.id}
            ticketId={ticket.id}
            accessKey={ticket.key}
            index={index}
            total={tickets.length}
          />
        ))}
        {tickets.length === 0 ? (
          <p className="text-sm text-white/50">
            Tu ticket está en tu correo. Si no lo ves, revisa la carpeta de spam.
          </p>
        ) : null}
      </div>

      <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
        <Mail className="size-5 text-white/50" strokeWidth={1.6} aria-hidden />
        <p className="text-[14px] leading-relaxed text-white/60">
          Guarda el correo o toma una captura del QR. En la entrada basta con
          mostrarlo o dictar el código.
        </p>
        <Link
          href="/login?next=%2Ftickets"
          className={buttonClass({ size: "md", variant: "secondary", full: true, className: "mt-1" })}
        >
          Guardarlo en una cuenta de Allons
        </Link>
        <p className="text-[12px] leading-relaxed text-white/35">
          Opcional. Entra con este mismo correo y tus tickets aparecen en tu cuenta y en la app.
        </p>
      </div>

      <Link
        href={eventId ? `/eventos/${encodeURIComponent(eventId)}` : "/eventos"}
        className="mt-6 text-[13px] text-white/40 transition hover:text-white"
      >
        Volver al evento
      </Link>
    </div>
  );
}

function GuestTicket({
  ticketId,
  accessKey,
  index,
  total,
}: {
  ticketId: string;
  accessKey: string;
  index: number;
  total: number;
}) {
  const query = useQuery({
    queryKey: guestKeys.ticket(ticketId, accessKey),
    queryFn: () => getGuestTicket(ticketId, accessKey),
  });
  const ticket = query.data;
  const href = `/tickets/${encodeURIComponent(ticketId)}?k=${encodeURIComponent(accessKey)}`;
  if (!ticket) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-72 rounded-[28px]" />
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }
  return (
    <section aria-label={`Ticket ${index + 1}`} className="flex flex-col items-center gap-5">
      {total > 1 || ticket.holderName ? (
        <div>
          {total > 1 ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">
              Ticket {index + 1} de {total}
            </p>
          ) : null}
          {ticket.holderName ? (
            <p className="mt-1 text-[16px] font-semibold tracking-tight text-white/85">
              {ticket.holderName}
            </p>
          ) : null}
        </div>
      ) : null}
      {ticket.answers?.length ? (
        <ul className="flex flex-wrap justify-center gap-3">
          {ticket.answers.map((row) => (
            <li
              key={row.label}
              className="min-w-[140px] rounded-[18px] bg-accent-soft px-5 py-3 ring-1 ring-accent/45"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {row.label}
              </p>
              <p className="mt-1 break-words text-[24px] font-bold leading-none tracking-[-0.02em] text-white">
                {row.answer}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      <TicketQr payload={ticket.qrPayload} />
      <TicketCode code={ticket.code} />
      <Link href={href} className="text-[13px] font-semibold text-white/60 underline underline-offset-4 hover:text-white">
        Abrir este ticket en su página
      </Link>
    </section>
  );
}
