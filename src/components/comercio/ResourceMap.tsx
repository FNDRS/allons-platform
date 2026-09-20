"use client";

import { useState } from "react";
import type { ProviderResource, ProviderResourceGroup } from "@/lib/api/provider";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ResourceGrid } from "@/components/tickets/ResourceGrid";

/** Who holds each unit, with door fixes (release / assign by ticket id). */
export function ResourceMap({
  groups,
  onRelease,
  onAssign,
  busy,
}: {
  groups: ProviderResourceGroup[];
  onRelease: (resourceId: string) => void;
  onAssign: (resourceId: string, ticketId: string) => void;
  busy: boolean;
}) {
  const [selected, setSelected] = useState<{ group: ProviderResourceGroup; unit: ProviderResource } | null>(null);
  const [ticketId, setTicketId] = useState("");

  if (groups.length === 0) return null;

  return (
    <section>
      <SectionTitle>Mapa de recursos</SectionTitle>
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <p className="font-semibold tracking-tight">{group.name}</p>
              <p className="text-sm text-white/55">
                <span className="font-semibold text-white">{group.assigned}</span> / {group.total} asignadas
              </p>
            </div>
            <ResourceGrid
              columns={group.columns}
              tiles={group.resources
                .filter((unit) => unit.active)
                .map((unit) => ({
                  id: unit.id,
                  label: unit.label,
                  taken: Boolean(unit.ticket),
                  caption: unit.ticket ? unit.ticket.holderName ?? unit.ticket.code : null,
                }))}
              onSelect={(tile) => {
                const unit = group.resources.find((item) => item.id === tile.id);
                if (unit) {
                  setSelected({ group, unit });
                  setTicketId("");
                }
              }}
            />
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
