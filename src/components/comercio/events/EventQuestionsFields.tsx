import { Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SwitchRow } from "@/components/ui/SwitchRow";
import type { useEventQuestions } from "@/hooks/event-form/useEventQuestions";
import { MAX_EVENT_QUESTIONS, eventQuestionKindLabel } from "@/lib/eventQuestions";
import { EventQuestionCard } from "./EventQuestionCard";

/**
 * The registration form: what buyers answer when they get a ticket, besides
 * their name and email. Campaign questions come from the hub and are shown
 * read-only.
 */
export function EventQuestionsFields({ q }: { q: ReturnType<typeof useEventQuestions> }) {
  return (
    <Card className="flex flex-col gap-4">
      <SwitchRow
        label="Pedir datos al registrarse"
        hint="Preguntas al comprar o reservar, además del nombre y correo. Cada una se hace a cada asistente o una sola vez a quien compra."
        checked={q.enabled}
        onChange={q.setEnabled}
      />

      {q.campaignQuestions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] leading-5 text-dim">
            Estas preguntas vienen de una campaña en la que participa el evento. Solo quien
            organiza la campaña puede cambiarlas.
          </p>
          {q.campaignQuestions.map((question) => (
            <div
              key={question.id}
              className="flex items-center gap-3 rounded-[14px] border border-border bg-surface-2 px-4 py-3"
            >
              <Lock className="size-4 shrink-0 text-white/40" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold tracking-tight">{question.label}</span>
                <span className="block text-[12px] text-dim">
                  {eventQuestionKindLabel(question.kind)}
                  {question.required ? " · Obligatoria" : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {q.enabled ? (
        <>
          {q.questions.map((question, index) => (
            <EventQuestionCard
              key={question.key}
              question={question}
              index={index}
              isFirst={index === 0}
              isLast={index === q.questions.length - 1}
              onChange={(patch) => q.update(question.key, patch)}
              onMove={(direction) => q.move(question.key, direction)}
              onRemove={() => q.remove(question.key)}
            />
          ))}
          {q.questions.length === 0 ? (
            <p className="text-[13px] text-white/50">
              Sin preguntas, el registro solo pide nombre y correo.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" disabled={!q.canAdd} onClick={q.add}>
              <Plus className="size-4" aria-hidden />
              Agregar pregunta
            </Button>
            {!q.canAdd ? (
              <span className="text-[12px] text-dim">Llegaste al máximo de {MAX_EVENT_QUESTIONS}.</span>
            ) : null}
          </div>
        </>
      ) : null}
    </Card>
  );
}
