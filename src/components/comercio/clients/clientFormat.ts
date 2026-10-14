import type { ClassClient, ClassMembershipStatus } from "@/lib/api/classClients";

export const MEMBERSHIP_STATUS_LABELS: Record<ClassMembershipStatus, string> = {
  active: "Activa",
  past_due: "Pago pendiente",
  cancelled: "Cancelada",
  completed: "Terminada",
};

/** What the client can still book: membership, unlimited pass or credits. */
export function clientBalanceLabel(client: ClassClient): string {
  if (client.membership) {
    return `${client.membership.name} · ${MEMBERSHIP_STATUS_LABELS[client.membership.status]}`;
  }
  if (client.hasUnlimited) return "Pase ilimitado";
  if (client.creditsRemaining > 0) {
    return `${client.creditsRemaining} ${client.creditsRemaining === 1 ? "clase disponible" : "clases disponibles"}`;
  }
  return "Sin clases disponibles";
}
