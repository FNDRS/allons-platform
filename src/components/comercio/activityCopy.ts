import type { ProviderActivityRow } from "@/lib/api/provider";

const TYPE_LABEL: Record<string, string> = {
  sale: "Venta",
  scan: "Escaneo",
  payout: "Retiro",
  event: "Evento",
  staff: "Personal",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function activityTypeLabel(type: string): string {
  return TYPE_LABEL[type] ?? "Actividad";
}

/** What `meta` means for this row, when it is something a person can read. */
export function activityExtra(row: ProviderActivityRow): {
  label: string;
  value: string;
  eventId: string | null;
} | null {
  const meta = row.meta?.trim();
  if (!meta) return null;
  if (UUID_RE.test(meta)) {
    if (row.type === "event" || row.type === "sale") {
      return { label: "Evento", value: "Abrir el evento", eventId: meta };
    }
    return null;
  }
  if (row.type === "scan") return { label: "Asistente", value: meta, eventId: null };
  if (row.type === "payout") return { label: "Método", value: meta, eventId: null };
  if (row.type === "sale") return { label: "Monto", value: meta, eventId: null };
  return { label: "Detalle", value: meta, eventId: null };
}
