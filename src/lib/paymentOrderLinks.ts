import { isClassPackageOrder, type PaymentOrderDetail } from "@/lib/api/payments";

/** Where to start again after a failed or abandoned payment. */
export function retryHrefFor(
  order: PaymentOrderDetail | undefined,
  eventIdParam: string | null,
): string {
  if (order && isClassPackageOrder(order) && order.classProgramId) {
    return `/clases/${encodeURIComponent(order.classProgramId)}`;
  }
  const eventId = order?.eventId ?? eventIdParam;
  return eventId ? `/eventos/${encodeURIComponent(eventId)}/reservar` : "/eventos";
}

/** What a confirmed payment delivered, and where to see it. */
export function paidOutcomeFor(order: PaymentOrderDetail): {
  body: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
} {
  if (isClassPackageOrder(order)) {
    return {
      body: "Tus sesiones ya están en tu cuenta. Elige el día y la hora de tu clase.",
      primary: {
        href: order.classProgramId
          ? `/clases/${encodeURIComponent(order.classProgramId)}#agenda`
          : "/tickets",
        label: "Agendar mi clase",
      },
      secondary: { href: "/tickets", label: "Ver mis clases" },
    };
  }
  return {
    body: "Tu ticket ya está en tu cuenta.",
    primary: {
      href: `/tickets/${encodeURIComponent(order.ticketIds[0])}?nuevo=1`,
      label: "Ver mi ticket",
    },
    secondary: { href: "/tickets", label: "Ir a mis tickets" },
  };
}
