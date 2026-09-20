"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ProviderResourceGroup, ResourceGroupInput } from "@/lib/api/provider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FieldError, Input, Label, Textarea } from "@/components/ui/Field";
import { ResourceGrid } from "@/components/tickets/ResourceGrid";

type Mode = "generate" | "custom";

interface Draft {
  id?: string;
  name: string;
  description: string;
  columns: string;
  mode: Mode;
  prefix: string;
  count: string;
  custom: string;
}

function draftFromGroup(group: ProviderResourceGroup): Draft {
  const labels = group.resources.filter((unit) => unit.active).map((unit) => unit.label);
  const generated = detectSeries(labels);
  return {
    id: group.id,
    name: group.name,
    description: group.description ?? "",
    columns: group.columns ? String(group.columns) : "",
    mode: generated ? "generate" : "custom",
    prefix: generated?.prefix ?? "",
    count: generated ? String(labels.length) : "",
    custom: labels.join("\n"),
  };
}

function emptyDraft(): Draft {
  return { name: "", description: "", columns: "", mode: "generate", prefix: "B", count: "14", custom: "" };
}

/** "B1..B14" → { prefix: "B" } when every label follows prefix+index. */
function detectSeries(labels: string[]): { prefix: string } | null {
  if (labels.length === 0) return null;
  const match = labels[0].match(/^(.*?)(\d+)$/);
  if (!match) return null;
  const prefix = match[1];
  const ok = labels.every((label, index) => label === `${prefix}${index + 1}`);
  return ok ? { prefix } : null;
}

function labelsOf(draft: Draft): string[] {
  if (draft.mode === "generate") {
    const count = Math.min(500, Math.max(0, Number.parseInt(draft.count, 10) || 0));
    return Array.from({ length: count }, (_, index) => `${draft.prefix.trim()}${index + 1}`);
  }
  return draft.custom
    .split(/\r?\n|,/)
    .map((label) => label.trim())
    .filter(Boolean);
}

/**
 * Define the units an event hands out. Sends every group on save because the
 * API replaces the whole set; units a ticket already holds cannot be dropped
 * and the API says so.
 */
export function ResourceGroupEditor({
  groups,
  onSave,
  saving,
}: {
  groups: ProviderResourceGroup[];
  onSave: (input: ResourceGroupInput[]) => void;
  saving: boolean;
}) {
  const [drafts, setDrafts] = useState<Draft[]>(() => groups.map(draftFromGroup));
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The map refetches in the background; only mirror it while the editor is
  // closed so a refresh never wipes what the organizer is typing.
  useEffect(() => {
    if (!open) setDrafts(groups.map(draftFromGroup));
  }, [groups, open]);

  const preview = useMemo(() => drafts.map(labelsOf), [drafts]);

  function update(index: number, patch: Partial<Draft>) {
    setDrafts((current) => current.map((draft, idx) => (idx === index ? { ...draft, ...patch } : draft)));
  }

  function save() {
    setError(null);
    const payload: ResourceGroupInput[] = [];
    for (const [index, draft] of drafts.entries()) {
      const labels = preview[index];
      if (!draft.name.trim()) return setError("Cada grupo necesita un nombre (ej. Bicicleta).");
      if (labels.length === 0) return setError(`"${draft.name}" necesita al menos una unidad.`);
      const columns = Number.parseInt(draft.columns, 10);
      payload.push({
        ...(draft.id ? { id: draft.id } : {}),
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        required: true,
        columns: Number.isFinite(columns) && columns >= 1 ? Math.min(12, columns) : null,
        labels,
      });
    }
    onSave(payload);
  }

  return (
    <section>
      <SectionTitle
        action={
          <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
            {open ? "Ocultar" : groups.length ? "Editar" : "Configurar"}
          </Button>
        }
      >
        Recursos asignables
      </SectionTitle>
      {!open ? (
        <p className="text-sm text-white/50">
          {groups.length
            ? `${groups.length} grupo(s) configurado(s). Los asistentes eligen su unidad al comprar.`
            : "Ej. bicicletas de una clase de spinning: cada comprador elige la suya y queda bloqueada para los demás."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map((draft, index) => (
            <Card key={draft.id ?? `new-${index}`} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold tracking-tight">Grupo {index + 1}</p>
                <button
                  type="button"
                  onClick={() => setDrafts((current) => current.filter((_, idx) => idx !== index))}
                  className="flex items-center gap-1 text-sm text-red-300 hover:text-red-200"
                >
                  <Trash2 className="size-4" /> Quitar
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <Label>Nombre de la unidad</Label>
                  <Input value={draft.name} onChange={(e) => update(index, { name: e.target.value })} placeholder="Bicicleta" />
                </label>
                <label className="block">
                  <Label hint="(opcional)">Columnas del mapa</Label>
                  <Input type="number" min={1} max={12} inputMode="numeric" value={draft.columns} onChange={(e) => update(index, { columns: e.target.value })} placeholder="7" />
                </label>
              </div>
              <label className="block">
                <Label hint="(opcional)">Instrucciones para el asistente</Label>
                <Textarea value={draft.description} onChange={(e) => update(index, { description: e.target.value })} placeholder="Las bicis de la fila de adelante quedan frente al coach." />
              </label>

              <div className="flex gap-2">
                <ModeButton active={draft.mode === "generate"} onClick={() => update(index, { mode: "generate" })}>Generar</ModeButton>
                <ModeButton active={draft.mode === "custom"} onClick={() => update(index, { mode: "custom" })}>Lista propia</ModeButton>
              </div>
              {draft.mode === "generate" ? (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <Label>Prefijo</Label>
                    <Input value={draft.prefix} onChange={(e) => update(index, { prefix: e.target.value })} placeholder="B" maxLength={10} />
                  </label>
                  <label className="block">
                    <Label>Cantidad</Label>
                    <Input type="number" min={1} max={500} inputMode="numeric" value={draft.count} onChange={(e) => update(index, { count: e.target.value })} />
                  </label>
                </div>
              ) : (
                <label className="block">
                  <Label hint="(una por línea)">Etiquetas</Label>
                  <Textarea value={draft.custom} onChange={(e) => update(index, { custom: e.target.value })} placeholder={"COACH\nB1\nB2"} className="font-mono text-sm" />
                </label>
              )}
              {preview[index].length > 0 ? (
                <div>
                  <p className="mb-2 text-xs text-white/45">Vista previa · {preview[index].length} unidades</p>
                  <ResourceGrid
                    compact
                    columns={Number.parseInt(draft.columns, 10) || null}
                    tiles={preview[index].map((label, idx) => ({ id: `${idx}`, label, taken: false }))}
                  />
                </div>
              ) : null}
            </Card>
          ))}

          <button
            type="button"
            onClick={() => setDrafts((current) => [...current, emptyDraft()])}
            className="flex items-center justify-center gap-2 rounded-[22px] border border-dashed border-white/15 py-4 text-sm font-semibold text-white/70 hover:bg-white/[0.04]"
          >
            <Plus className="size-4" /> Agregar grupo
          </button>

          <FieldError>{error}</FieldError>
          <div className="flex gap-3">
            <Button loading={saving} onClick={save}>Guardar recursos</Button>
            <Button variant="ghost" onClick={() => { setDrafts(groups.map(draftFromGroup)); setOpen(false); }}>Cancelar</Button>
          </div>
          <p className="text-xs text-white/45">
            Una unidad que ya eligió un asistente no se puede quitar; libérala primero desde el mapa.
          </p>
        </div>
      )}
    </section>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[13px] font-semibold ${active ? "bg-white text-black" : "border border-white/10 text-white/70"}`}
    >
      {children}
    </button>
  );
}
