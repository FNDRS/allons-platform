import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ClassProgramStatus } from "@/lib/api/providerClassPrograms";

/** Save as draft or publish, plus a way out without saving. */
export function ClassProgramFormActions({
  canSaveDraft,
  canPublish,
  missingForPublish,
  savingTarget,
  cancelHref,
  onSave,
}: {
  canSaveDraft: boolean;
  canPublish: boolean;
  missingForPublish: string[];
  savingTarget: ClassProgramStatus | null;
  cancelHref: string;
  onSave: (status: ClassProgramStatus) => void;
}) {
  const saving = savingTarget !== null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          size="lg"
          loading={savingTarget === "draft"}
          disabled={!canSaveDraft || saving}
          onClick={() => onSave("draft")}
        >
          Guardar como borrador
        </Button>
        <Button
          size="lg"
          loading={savingTarget === "published"}
          disabled={!canPublish || saving}
          onClick={() => onSave("published")}
        >
          Publicar programa
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
      {missingForPublish.length > 0 ? (
        <p className="text-[12px] text-dim">
          Para publicar falta {missingForPublish.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}
