import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { EventSaveTarget } from "@/hooks/useEventForm";

/**
 * Save as draft or send to review, plus a way out without saving. An event
 * that is already public only saves its changes: it stays public, and taking
 * it down is not something to do by accident from a form.
 */
export function EventFormActions({
  isLive,
  canSaveDraft,
  canSubmit,
  missingForDraft,
  missingForReview,
  savingTarget,
  cancelHref,
  onSave,
}: {
  isLive: boolean;
  canSaveDraft: boolean;
  canSubmit: boolean;
  missingForDraft: string[];
  missingForReview: string[];
  savingTarget: EventSaveTarget | null;
  cancelHref: string;
  onSave: (target: EventSaveTarget) => void;
}) {
  const saving = savingTarget !== null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {isLive ? null : (
          <Button
            variant="secondary"
            size="lg"
            loading={savingTarget === "draft"}
            disabled={!canSaveDraft || saving}
            onClick={() => onSave("draft")}
          >
            Guardar como borrador
          </Button>
        )}
        <Button
          size="lg"
          loading={savingTarget === "published"}
          disabled={!canSubmit || saving}
          onClick={() => onSave("published")}
        >
          {isLive ? "Guardar cambios" : "Enviar a revisión"}
        </Button>
        <Link
          href={cancelHref}
          aria-label="Cancelar"
          title="Cancelar"
          className="inline-flex size-13 shrink-0 items-center justify-center rounded-full border border-border-strong text-white/70 transition hover:bg-surface-2 hover:text-white"
        >
          <X className="size-5" aria-hidden />
        </Link>
      </div>
      {missingForReview.length > 0 ? (
        <p className="text-[12px] text-dim">
          {isLive ? "Para guardar" : "Para enviar a revisión"} falta {missingForReview.join(", ")}.
        </p>
      ) : null}
      {!isLive && missingForDraft.length > 0 ? (
        <p className="text-[12px] text-dim">
          Para guardar el borrador falta {missingForDraft.join(", ")}.
        </p>
      ) : null}
      {!isLive ? (
        <p className="text-[12px] text-dim">
          Revisamos cada evento antes de publicarlo. Te avisaremos cuando esté publicado.
        </p>
      ) : null}
    </div>
  );
}
