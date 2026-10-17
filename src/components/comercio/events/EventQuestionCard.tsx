import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Pill";
import { SwitchRow } from "@/components/ui/SwitchRow";
import type { EventQuestionDraft } from "@/hooks/event-form/useEventQuestions";
import {
  EVENT_QUESTION_KINDS,
  MAX_QUESTION_LABEL,
  MAX_QUESTION_OPTIONS,
  eventQuestionKindLabel,
  questionNeedsOptions,
} from "@/lib/eventQuestions";

/** One question of the registration form: text, kind, options, required. */
export function EventQuestionCard({
  question,
  index,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: {
  question: EventQuestionDraft;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<EventQuestionDraft>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const n = index + 1;
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-dim">
          Pregunta {n} · {eventQuestionKindLabel(question.kind)}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Subir pregunta ${n}`}
            disabled={isFirst}
            onClick={() => onMove(-1)}
          >
            <ArrowUp className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Bajar pregunta ${n}`}
            disabled={isLast}
            onClick={() => onMove(1)}
          >
            <ArrowDown className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={`Quitar pregunta ${n}`} onClick={onRemove}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      <Input
        placeholder="Ej. ¿Cuál es tu talla de camiseta?"
        value={question.label}
        maxLength={MAX_QUESTION_LABEL}
        onChange={(e) => onChange({ label: e.target.value })}
        aria-label={`Texto de la pregunta ${n}`}
      />
      <div className="flex flex-col gap-1.5">
        <Label>Tipo</Label>
        <div role="group" aria-label={`Tipo de la pregunta ${n}`} className="flex flex-wrap gap-2">
          {EVENT_QUESTION_KINDS.map((kind) => (
            <Chip
              key={kind.value}
              tone="gray"
              active={question.kind === kind.value}
              onClick={() => onChange({ kind: kind.value })}
            >
              {kind.label}
            </Chip>
          ))}
        </div>
      </div>
      {questionNeedsOptions(question.kind) ? (
        <div className="flex flex-col gap-1.5">
          <Label hint={`(sepáralas con comas, hasta ${MAX_QUESTION_OPTIONS})`}>Opciones</Label>
          <Input
            placeholder="S, M, L, XL"
            value={question.optionsText}
            onChange={(e) => onChange({ optionsText: e.target.value })}
            aria-label={`Opciones de la pregunta ${n}`}
          />
        </div>
      ) : null}
      <SwitchRow
        label="Obligatoria"
        hint="No se puede comprar ni reservar sin responderla."
        checked={question.required}
        onChange={(required) => onChange({ required })}
      />
    </div>
  );
}
