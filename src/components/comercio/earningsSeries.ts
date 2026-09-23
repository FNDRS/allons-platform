import type { ProviderActivityRow } from "@/lib/api/provider";

const SALE_RE = /^Venta registrada:\s*(\d+)\s*ticket\(s\)\s*para\s+/i;
const TZ = "America/Tegucigalpa";

export type EarningsPoint = { label: string; total: number };

function amountOf(row: ProviderActivityRow): number | null {
  const match = row.message.match(SALE_RE);
  const quantity = match ? Number(match[1]) : null;
  const unit = row.meta ? Number(row.meta.replace(/[^\d.]/g, "")) : NaN;
  if (!quantity || !Number.isFinite(unit)) return null;
  return quantity * unit;
}

function part(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleString("es-HN", { timeZone: TZ, ...options });
}

/** Cumulative earnings. Same-day sales step by hour; otherwise by day. */
export function earningsSeries(rows: ProviderActivityRow[]): EarningsPoint[] {
  const sales = rows
    .filter((row) => row.type === "sale")
    .map((row) => ({ at: row.date, amount: amountOf(row) }))
    .filter((row): row is { at: string; amount: number } => row.amount !== null)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  if (sales.length === 0) return [];

  const days = new Set(
    sales.map((sale) =>
      part(sale.at, { year: "numeric", month: "2-digit", day: "2-digit" }),
    ),
  );
  const byHour = days.size === 1;
  const buckets = new Map<
    string,
    { label: string; amount: number; at: number }
  >();

  for (const sale of sales) {
    const key = byHour
      ? part(sale.at, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
        })
      : part(sale.at, { year: "numeric", month: "2-digit", day: "2-digit" });
    const label = byHour
      ? part(sale.at, { hour: "numeric" }).replace(/\./g, "")
      : part(sale.at, { day: "numeric", month: "short" }).replace(/\./g, "");
    const current = buckets.get(key);
    if (current) current.amount += sale.amount;
    else
      buckets.set(key, {
        label,
        amount: sale.amount,
        at: new Date(sale.at).getTime(),
      });
  }

  let running = 0;
  return [...buckets.values()]
    .sort((a, b) => a.at - b.at)
    .map((bucket) => {
      running += bucket.amount;
      return { label: bucket.label, total: running };
    });
}
