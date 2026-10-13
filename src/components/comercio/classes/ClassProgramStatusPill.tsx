import { StatusPill } from "@/components/ui/Pill";
import { CLASS_PROGRAM_STATUS_LABELS } from "@/hooks/class-program-form/constants";
import type { ClassProgramStatus } from "@/lib/api/providerClassPrograms";

const TONE = { draft: "mute", published: "solid", archived: "gray" } as const;

/** Borrador, Publicado or Archivado. */
export function ClassProgramStatusPill({ status }: { status: ClassProgramStatus }) {
  return <StatusPill tone={TONE[status]}>{CLASS_PROGRAM_STATUS_LABELS[status]}</StatusPill>;
}
