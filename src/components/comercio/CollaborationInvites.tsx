"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowUpRight, Handshake } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useCollaborations } from "@/hooks/useCollaborations";
import type { CollaborationInvite } from "@/lib/api/provider";
import { comercioInitials } from "@/lib/api/comercios";
import { formatCardDay, formatCardTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";

function HostAvatar({ invite }: { invite: CollaborationInvite }) {
  const name = invite.host?.name ?? "Comercio";
  if (invite.host?.logoUrl) {
    return (
      <img
        src={invite.host.logoUrl}
        alt=""
        className="size-11 shrink-0 rounded-[12px] object-cover ring-1 ring-white/10"
      />
    );
  }
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-surface-2 text-[13px] font-bold text-white/70 ring-1 ring-white/10">
      {comercioInitials(name)}
    </span>
  );
}

function InviteRow({
  invite,
  onRespond,
  busy,
}: {
  invite: CollaborationInvite;
  onRespond?: (accept: boolean) => void;
  busy?: boolean;
}) {
  const when = [formatCardDay(invite.event.startsAt), formatCardTime(invite.event.startsAt)]
    .filter(Boolean)
    .join(" · ");
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <HostAvatar invite={invite} />
        <div className="min-w-0">
          <p className="truncate text-[13px] text-white/45">
            {invite.host?.name ?? "Un comercio"} te invitó a colaborar
          </p>
          <p className="truncate font-semibold tracking-tight">{invite.event.title}</p>
          <p className="truncate text-[13px] text-white/50">
            {[when || null, invite.event.city].filter(Boolean).join(" · ") || "Sin fecha"}
          </p>
        </div>
      </div>
      {onRespond ? (
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => onRespond(false)}>
            Rechazar
          </Button>
          <Button size="sm" disabled={busy} onClick={() => onRespond(true)}>
            Aceptar
          </Button>
        </div>
      ) : (
        <Link
          href={`/comercio/events/${encodeURIComponent(invite.event.id)}`}
          className={`inline-flex h-9 shrink-0 items-center gap-1.5 px-4 text-[13px] ${glassCtaClass}`}
        >
          Abrir
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </Card>
  );
}

/**
 * Pending invites to co-host other comercios' events. Sits at the top of
 * the dashboard so an invite is never missed, and renders nothing when
 * there is none.
 */
export function CollaborationInvitesBanner() {
  const { ready } = useProviderAccess();
  const collaborations = useCollaborations(ready);
  if (collaborations.pending.length === 0) return null;
  const busyId = collaborations.respond.isPending
    ? collaborations.respond.variables?.id
    : undefined;
  return (
    <section>
      <SectionTitle
        action={
          <Link
            href="/comercio/colaboraciones"
            className="text-[12px] font-semibold text-dim transition hover:text-white"
          >
            Ver todas
          </Link>
        }
      >
        Invitaciones
      </SectionTitle>
      <div className="flex flex-col gap-2.5">
        {collaborations.pending.map((invite) => (
          <InviteRow
            key={invite.id}
            invite={invite}
            busy={busyId === invite.id}
            onRespond={(accept) =>
              collaborations.respond.mutate({ id: invite.id, accept })
            }
          />
        ))}
      </div>
    </section>
  );
}

/** The full page: open invites, then the events this comercio co-hosts. */
export function CollaborationsView() {
  const { ready } = useProviderAccess();
  const collaborations = useCollaborations(ready);
  const busyId = collaborations.respond.isPending
    ? collaborations.respond.variables?.id
    : undefined;

  if (collaborations.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
    );
  }
  if (collaborations.error) {
    return (
      <ErrorState
        message={(collaborations.error as Error).message}
        onRetry={() => void collaborations.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle>Invitaciones pendientes</SectionTitle>
        {collaborations.pending.length === 0 ? (
          <EmptyState
            title="Sin invitaciones"
            body="Cuando otro comercio te invite a colaborar en su evento, aparecerá aquí."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {collaborations.pending.map((invite) => (
              <InviteRow
                key={invite.id}
                invite={invite}
                busy={busyId === invite.id}
                onRespond={(accept) =>
                  collaborations.respond.mutate({ id: invite.id, accept })
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Eventos donde colaboras</SectionTitle>
        {collaborations.accepted.length === 0 ? (
          <Card className="flex items-start gap-3">
            <Handshake className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden />
            <p className="text-[14px] leading-relaxed text-white/60">
              Un evento colaborativo lo organiza un comercio y lo comparte con
              hasta cinco más. Todos ven sus ventas, dinero y escaneos aquí en
              el panel, y el equipo de cada uno puede escanear en la puerta. El
              dinero se liquida al organizador.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {collaborations.accepted.map((invite) => (
              <InviteRow key={invite.id} invite={invite} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
