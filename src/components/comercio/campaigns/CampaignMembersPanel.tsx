"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import type { HubCampaignMember } from "@/lib/api/campaigns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/States";
import { MEMBER_STATUS_LABEL } from "./campaignFormat";

const isRequest = (m: HubCampaignMember) => m.status === "pending" && m.initiatedBy === "comercio";

/** Invite comercios by @handle, answer their requests, remove them. */
export function CampaignMembersPanel({
  members,
  inviting,
  onInvite,
  busyMemberId,
  onAnswer,
  onRemove,
}: {
  members: HubCampaignMember[];
  inviting: boolean;
  onInvite: (handle: string) => Promise<unknown>;
  busyMemberId?: string;
  onAnswer: (memberId: string, approve: boolean) => void;
  onRemove: (member: HubCampaignMember) => void;
}) {
  const [handle, setHandle] = useState("");
  const submit = () => {
    const value = handle.trim();
    if (!value) return;
    // Only clear what was sent: the hub may be typing the next one.
    onInvite(value)
      .then(() => setHandle((cur) => (cur.trim() === value ? "" : cur)))
      .catch(() => undefined);
  };
  const sorted = [...members].sort((a, b) => Number(!isRequest(a)) - Number(!isRequest(b)));

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input
          className="flex-1"
          placeholder="@handle del comercio"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          aria-label="Handle del comercio a invitar"
        />
        <Button type="submit" loading={inviting} disabled={!handle.trim()}>
          <UserPlus className="size-4" aria-hidden />
          Invitar
        </Button>
      </form>

      {sorted.length === 0 ? (
        <EmptyState
          title="Nadie en la campaña todavía"
          body="Invita comercios por su @handle. También pueden pedir unirse si la campaña está publicada."
        />
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {sorted.map((m) => {
            const busy = busyMemberId === m.id;
            const removable = m.status === "pending" || m.status === "accepted";
            return (
              <div key={m.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.provider.name}</p>
                  <p className="truncate text-[13px] text-white/50">
                    {m.provider.handle ? `@${m.provider.handle} · ` : ""}
                    {isRequest(m) ? "Quiere unirse" : m.status === "pending" ? "Invitación enviada" : m.eventCount === 1 ? "1 evento" : `${m.eventCount} eventos`}
                  </p>
                </div>
                <StatusPill tone="mute">{MEMBER_STATUS_LABEL[m.status]}</StatusPill>
                {isRequest(m) ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => onAnswer(m.id, false)}>
                      Rechazar
                    </Button>
                    <Button size="sm" loading={busy} onClick={() => onAnswer(m.id, true)}>
                      Aceptar
                    </Button>
                  </div>
                ) : removable ? (
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => onRemove(m)}>
                    {m.status === "pending" ? "Cancelar invitación" : "Quitar"}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
