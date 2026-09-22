"use client";

import { useState } from "react";
import type { ProviderResource, ProviderResourceGroup } from "@/lib/api/provider";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ResourceGrid, studioFrontLabel } from "@/components/tickets/ResourceGrid";

/** Who holds each unit, with the ticket they will sit on. */
export function ResourceMap({
  groups,
  typeNames = {},
  onRelease,
  onAssign,
  busy,
}: {
  groups: ProviderResourceGroup[];
  /** Ticket type id to the name the buyer bought, e.g. a class hour. */
  typeNames?: Record<string, string>;
  onRelease: (resourceId: string) => void;
  onAssign: (resourceId: string, ticketId: string) => void;
  busy: boolean;
}) {
  const [selected, setSelected] = useState<{ group: ProviderResourceGroup; unit: ProviderResource } | null>(null);
  const [ticketId, setTicketId] = useState("");

  if (groups.length === 0) return null;

  return (
    <section>
      <SectionTitle>Quién se sienta dónde</SectionTitle>
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <div className="mb-4 flex min-w-0 items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold tracking-tight">
                  {group.ticketTypeId && typeNames[group.ticketTypeId]
                    ? typeNames[group.ticketTypeId]
                    : group.name}
                </p>
                {group.ticketTypeId && typeNames[group.ticketTypeId] ? (
                  <p className="text-[13px] text-white/45">{group.name}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-sm text-white/55">
                <span className="font-semibold text-white">{group.assigned}</span> / {group.total} ocupadas
              </p>
            </div>
            <ResourceGrid
              columns={group.columns}
              frontLabel={studioFrontLabel(group.name)}
              tiles={group.resources
                // A retired unit stays on the map while a ticket holds it, so
                // the organizer can still release or move that holder.
                .filter((unit) => unit.active || unit.ticket)
                .map((unit) => ({
                  id: unit.id,
                  label: unit.label,
                  taken: Boolean(unit.ticket),
                  caption: unit.ticket
                    ? unit.ticket.holderName ?? unit.ticket.code
                    : null,
                }))}
              onSelect={(tile) => {
                const unit = group.resources.find((item) => item.id === tile.id);
                if (unit) {
                  setSelected({ group, unit });
                  setTicketId("");
                }
              }}
            />
            <SeatList group={group} />
          </Card>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.group.name} ${selected.unit.label}` : ""}
      >
        {selected?.unit.ticket ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-white/[0.05] p-4">
              <p className="text-lg font-semibold tracking-tight">
                {selected.unit.ticket.holderName ?? "Sin nombre"}
              </p>
              <p className="text-sm text-white/55">{selected.unit.ticket.holderEmail ?? "—"}</p>
              <p className="mt-2 font-mono text-sm tracking-widest text-white/80">{selected.unit.ticket.code}</p>
              {selected.unit.ticket.assignedAt ? (
                <p className="mt-1 text-xs text-white/40">
                  Elegida {formatDateTime(selected.unit.ticket.assignedAt)}
                </p>
              ) : null}
            </div>
            <Button
              variant="danger"
              loading={busy}
              onClick={() => {
                onRelease(selected.unit.id);
                setSelected(null);
              }}
            >
              Liberar unidad
            </Button>
            <p className="text-xs text-white/45">
              Al liberarla, el asistente ya no la verá en su ticket y podrá elegir otra.
            </p>
          </div>
        ) : selected ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-white/60">Esta unidad está libre.</p>
            <label className="block">
              <Label hint="(id del ticket)">Asignar a un ticket</Label>
              <Input
                value={ticketId}
                onChange={(event) => setTicketId(event.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="font-mono text-sm"
              />
              <p className="mt-1.5 text-xs text-white/45">
                Necesita el identificador del ticket, no el código ALL-. Lo ves en el pago del
                comprador o en el escáner de la app.
              </p>
            </label>
            <Button
              variant="secondary"
              loading={busy}
              disabled={!/^[0-9a-f-]{36}$/i.test(ticketId.trim())}
              onClick={() => {
                onAssign(selected.unit.id, ticketId.trim());
                setSelected(null);
              }}
            >
              Asignar
            </Button>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

function SeatList({ group }: { group: ProviderResourceGroup }) {
  const seated = group.resources.filter((unit) => unit.ticket);
  if (seated.length === 0) {
    return <p className="mt-4 text-[13px] text-white/40">Nadie ha elegido lugar.</p>;
  }
  return (
    <ul className="mt-4 flex flex-col divide-y divide-white/[0.06]">
      {seated.map((unit) => (
        <li key={unit.id} className="flex items-baseline justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold tracking-tight">
              {unit.ticket?.holderName ?? "Sin nombre"}
            </p>
            {unit.ticket?.code ? (
              <p className="font-mono text-[12px] tracking-wide text-white/40">{unit.ticket.code}</p>
            ) : null}
          </div>
          <p className="shrink-0 text-[15px] font-bold tracking-tight">{unit.label}</p>
        </li>
      ))}
    </ul>
  );
}
