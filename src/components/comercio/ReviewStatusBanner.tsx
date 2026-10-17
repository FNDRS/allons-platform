import Link from "next/link";
import { CircleAlert, Hourglass, Pencil } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

/**
 * Where an event or class program stands in Allons' review. Renders nothing
 * unless it is waiting for review or was rejected.
 */
export function ReviewStatusBanner({
  status,
  rejectReason,
  editHref,
  kind,
}: {
  status: string;
  rejectReason?: string | null;
  /** Where to fix a rejected item. Omit to hide the link (e.g. no edit rights). */
  editHref?: string | null;
  kind: "evento" | "clase";
}) {
  if (status === "pending_review") {
    return (
      <div className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] text-white/80">
        <Hourglass className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
        <p>
          <span className="font-semibold text-white">En revisión.</span> Lo estamos revisando. Te
          avisaremos cuando esté publicado.
        </p>
      </div>
    );
  }
  if (status !== "rejected") return null;
  const reason = rejectReason?.trim();
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-white/80 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden />
        <div className="min-w-0">
          <p className="font-semibold text-white">
            {kind === "evento" ? "Tu evento no fue aprobado." : "Tu clase no fue aprobada."}
          </p>
          <p className="mt-0.5 whitespace-pre-line break-words">
            {reason
              ? `Motivo: ${reason}`
              : "Corrige lo que haga falta y vuelve a enviar a revisión."}
          </p>
        </div>
      </div>
      {editHref ? (
        <Link href={editHref} className={buttonClass({ variant: "secondary", size: "sm" })}>
          <Pencil className="size-4" aria-hidden />
          Editar y reenviar
        </Link>
      ) : null}
    </div>
  );
}
