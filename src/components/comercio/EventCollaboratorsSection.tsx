"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useEventCollaborators } from "@/hooks/useEventCollaborators";
import type { CollaboratorProvider, EventCollaborator } from "@/lib/api/provider";
import { comercioInitials } from "@/lib/api/comercios";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { Badge, ErrorState, Skeleton } from "@/components/ui/States";

function ProviderLine({
  provider,
  caption,
}: {
  provider: CollaboratorProvider;
  caption: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {provider.logoUrl ? (
        <img
          src={provider.logoUrl}
          alt=""
          className="size-10 shrink-0 rounded-[10px] object-cover ring-1 ring-white/10"
        />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-[12px] font-bold text-white/70 ring-1 ring-white/10">
          {comercioInitials(provider.name)}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold tracking-tight">{provider.name}</p>
        <p className="truncate text-[13px] text-white/50">
          {provider.handle ? `@${provider.handle} · ` : ""}
          {caption}
        </p>
      </div>
    </div>
  );
}

/**
 * The comercios on this event. The host sees who it invited and can add
 * one more by @handle or remove one; a collaborator sees who else is in
 * and who organizes.
 */
export function EventCollaboratorsSection({
  eventId,
  enabled,
}: {
  eventId: string;
  enabled: boolean;
}) {
  const state = useEventCollaborators(eventId, enabled);
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (state.isLoading) return <Skeleton className="h-32 rounded-[24px]" />;
  if (state.error || !state.data) {
    return (
      <ErrorState
        message={(state.error as Error | null)?.message}
        onRetry={() => void state.refetch()}
      />
    );
  }
  const { access, host, collaborators, seatsLeft } = state.data;
  const isHost = access === "owner";
  // Not a collaborative event yet, and only the host could make it one.
  if (!isHost && collaborators.length === 0) return null;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const value = handle.trim().replace(/^@/, "");
    if (!value) return setError("Escribe el @handle del comercio.");
    state.invite.mutate(value, { onSuccess: () => setHandle("") });
  }

  return (
    <section>
      <SectionTitle>Comercios en este evento</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {host ? (
          <Card className="flex items-center justify-between gap-3">
            <ProviderLine provider={host} caption="Organiza y recibe la liquidación" />
            <Badge tone="accent">{isHost ? "Tu comercio" : "Organizador"}</Badge>
          </Card>
        ) : null}
        {collaborators.map((row: EventCollaborator) => (
          <Card key={row.id} className="flex items-center justify-between gap-3">
            <ProviderLine
              provider={row.provider}
              caption={
                row.status === "accepted"
                  ? "Ve ventas, dinero y escaneos"
                  : "Invitación pendiente"
              }
            />
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={row.status === "accepted" ? "success" : "neutral"}>
                {row.status === "accepted" ? "Colabora" : "Invitado"}
              </Badge>
              {isHost ? (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={state.revoke.isPending && state.revoke.variables === row.provider.id}
                  onClick={() => state.revoke.mutate(row.provider.id)}
                >
                  Quitar
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
        {isHost && seatsLeft > 0 ? (
          <Card>
            <form onSubmit={submit} className="flex flex-col gap-3">
              <p className="text-[13px] text-white/55">
                Invita hasta {seatsLeft === 1 ? "un comercio más" : `${seatsLeft} comercios más`}.
                Verán las ventas, el dinero y los escaneos de este evento, y su
                equipo podrá escanear en la puerta. El dinero se sigue
                liquidando a tu comercio.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block min-w-0 flex-1">
                  <Label>Handle del comercio</Label>
                  <Input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@cafeluna"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </label>
                <Button type="submit" loading={state.invite.isPending} className="sm:mb-0">
                  <UserPlus className="size-4" aria-hidden /> Invitar
                </Button>
              </div>
              <FieldError>{error}</FieldError>
            </form>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
