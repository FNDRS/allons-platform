/** How a comercio reads its own event's status. */
export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  pending_review: "En revisión",
  rejected: "Rechazado",
  published: "Publicado",
  sold_out: "Agotado",
  ended: "Finalizado",
  suspended: "Suspendido",
};

export function eventStatusLabel(status: string): string {
  return EVENT_STATUS_LABELS[status] ?? status;
}

/**
 * Already approved and public. Editing one of these keeps it public; any
 * other status goes to review when it is sent with `published`.
 */
export function isLiveEventStatus(status: string | null | undefined): boolean {
  return status === "published" || status === "sold_out" || status === "ended";
}
