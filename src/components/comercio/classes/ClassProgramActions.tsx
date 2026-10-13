"use client";

import Link from "next/link";
import { Archive, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { Button, buttonClass } from "@/components/ui/Button";
import type { ClassProgramStatus, ProviderClassProgram } from "@/lib/api/providerClassPrograms";

/** Edit, archive or reactivate, and delete, each risky one behind a confirm. */
export function ClassProgramActions({
  program,
  busy,
  onChangeStatus,
  onDelete,
}: {
  program: ProviderClassProgram;
  busy: boolean;
  onChangeStatus: (status: ClassProgramStatus) => void;
  onDelete: () => void;
}) {
  const { confirm, dialog } = useConfirm();

  const archive = async () => {
    const ok = await confirm(
      "Archivar programa",
      `"${program.title}" dejará de aparecer en tu perfil y nadie podrá comprar paquetes ni agendar. Las reservas ya hechas se mantienen.`,
      "Archivar",
    );
    if (ok) onChangeStatus("archived");
  };

  const remove = async () => {
    const ok = await confirm(
      "Eliminar programa",
      `¿Eliminar "${program.title}"? Esta acción no se puede deshacer.`,
      "Eliminar",
    );
    if (ok) onDelete();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {dialog}
      <Link
        href={`/comercio/clases/${encodeURIComponent(program.id)}/editar`}
        className={buttonClass({ size: "sm" })}
      >
        <Pencil className="size-4" aria-hidden />
        Editar programa
      </Link>
      {program.status !== "published" ? (
        <Link
          href={`/comercio/clases/${encodeURIComponent(program.id)}/vista-previa`}
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          <Eye className="size-4" aria-hidden />
          Vista previa
        </Link>
      ) : null}
      {program.status === "archived" ? (
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => onChangeStatus("draft")}>
          <RotateCcw className="size-4" aria-hidden />
          Reactivar
        </Button>
      ) : (
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => void archive()}>
          <Archive className="size-4" aria-hidden />
          Archivar
        </Button>
      )}
      <Button variant="danger" size="sm" disabled={busy} onClick={() => void remove()}>
        <Trash2 className="size-4" aria-hidden />
        Eliminar
      </Button>
    </div>
  );
}
