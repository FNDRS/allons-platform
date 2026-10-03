"use client";

import { Trash2 } from "lucide-react";
import { QUESTION_KINDS, needsOptions, type QuestionDraft } from "@/hooks/useCampaignEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Pill";
import { SwitchRow } from "@/components/ui/SwitchRow";

/** One campaign question: text, kind, options and the hub's two requirements. */
export function CampaignQuestionFields({
  question,
  index,
  onChange,
  onRemove,
}: {
  question: QuestionDraft;
  index: number;
  onChange: (patch: Partial<QuestionDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-dim">
          Pregunta {index + 1}
        </p>
        <Button variant="ghost" size="icon-sm" aria-label="Quitar pregunta" onClick={onRemove}>
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
      <Input
        placeholder="Ej. ¿Qué carrera estudias?"
        value={question.label}
        maxLength={160}
        onChange={(e) => onChange({ label: e.target.value })}
        aria-label="Texto de la pregunta"
      />
      <div className="flex flex-col gap-1.5">
        <Label>Tipo</Label>
        {/* Chips, not a dropdown: all eight kinds stay visible and one click
            picks one, without a menu covering the rest of the form. */}
        <div role="group" aria-label="Tipo de pregunta" className="flex flex-wrap gap-2">
          {QUESTION_KINDS.map((k) => (
            <Chip key={k.value} active={question.kind === k.value} onClick={() => onChange({ kind: k.value })}>
              {k.label}
            </Chip>
          ))}
        </div>
      </div>
      {needsOptions(question.kind) ? (
        <div className="flex flex-col gap-1.5">
          <Label>Opciones (sepáralas con comas)</Label>
          <Input
            placeholder="Ingeniería, Negocios, Diseño"
            value={question.optionsText}
            onChange={(e) => onChange({ optionsText: e.target.value })}
          />
        </div>
      ) : null}
      <SwitchRow
        label="Obligatoria para los comercios"
        hint="Para unirse, el comercio tiene que compartirla."
        checked={question.requiredForComercio}
        onChange={(requiredForComercio) => onChange({ requiredForComercio })}
      />
      <SwitchRow
        label="Obligatoria para el asistente"
        hint="No se puede reservar sin responderla."
        checked={question.requiredForAttendee}
        onChange={(requiredForAttendee) => onChange({ requiredForAttendee })}
      />
    </Card>
  );
}
