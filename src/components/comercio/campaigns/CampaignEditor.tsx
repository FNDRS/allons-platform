"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";
import { useCampaignEditor } from "@/hooks/useCampaignEditor";
import type { CampaignStatus } from "@/lib/api/campaigns";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { DayPicker } from "@/components/ui/DayPicker";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { CampaignQuestionFields } from "./CampaignQuestionFields";

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicada" },
  { value: "archived", label: "Archivada" },
];

/** Far enough that no campaign date is ever disabled. */
const FAR_FUTURE = "2099-12-31";

/** Create or edit a campaign: name, dates, visibility and its questions. */
export function CampaignEditor({ id }: { id?: string }) {
  const f = useCampaignEditor(id);

  if (f.loading) return <Skeleton className="h-[420px] w-full rounded-[28px]" />;
  if (f.loadError) return <ErrorState message={f.loadError.message} onRetry={f.reload} />;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input
            placeholder="Mes del Emprendimiento"
            value={f.name}
            maxLength={120}
            onChange={(e) => f.setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Descripción</Label>
          <Textarea
            placeholder="De qué se trata y quién la organiza"
            value={f.description}
            maxLength={4000}
            rows={4}
            onChange={(e) => f.setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Inicia</Label>
            <DayPicker value={f.startDay} max={FAR_FUTURE} onChange={(d) => d && f.setStartDay(d)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Termina</Label>
            <DayPicker value={f.endDay} max={FAR_FUTURE} onChange={(d) => d && f.setEndDay(d)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Visibilidad</Label>
          <Segmented
            label="Visibilidad"
            tone="gray"
            value={f.status}
            options={STATUS_OPTIONS}
            onChange={f.setStatus}
          />
          <p className="text-[12px] text-dim">
            Solo una campaña publicada aparece en la app y recibe solicitudes de comercios.
          </p>
        </div>
      </Card>

      <section>
        <SectionTitle
          action={
            <Button variant="secondary" size="sm" onClick={f.addQuestion}>
              <Plus className="size-4" aria-hidden />
              Agregar
            </Button>
          }
        >
          Preguntas para los asistentes
        </SectionTitle>
        <p className="mb-3 text-[13px] text-white/50">
          Se agregan al formulario de cada evento de la campaña. Tú decides cuáles son obligatorias
          para los comercios y para los asistentes.
        </p>
        <div className="flex flex-col gap-3">
          {f.questions.map((q, i) => (
            <CampaignQuestionFields
              key={q.key}
              question={q}
              index={i}
              onChange={(patch) => f.updateQuestion(q.key, patch)}
              onRemove={() => f.removeQuestion(q.key)}
            />
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button size="lg" loading={f.saving} onClick={f.submit}>
          {f.editing ? "Guardar cambios" : "Crear campaña"}
        </Button>
        <Link
          href={id ? `/comercio/campanas/${encodeURIComponent(id)}` : "/comercio/campanas"}
          aria-label={f.editing ? "Cancelar cambios" : "Cancelar"}
          title={f.editing ? "Cancelar cambios" : "Cancelar"}
          className="inline-flex size-13 shrink-0 items-center justify-center rounded-full border border-border-strong text-white/70 transition hover:bg-surface-2 hover:text-white"
        >
          <X className="size-5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
