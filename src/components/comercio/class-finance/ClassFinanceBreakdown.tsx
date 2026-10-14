import { Card, SectionTitle } from "@/components/ui/Card";
import { CATALOG_KIND_LABELS } from "@/components/comercio/classes/catalog/catalogFormat";
import type { ClassFinance } from "@/lib/api/classFinance";
import { formatCents, formatNumber } from "@/lib/format";

function ListRow({ label, detail, value }: { label: string; detail: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3.5 text-[14px]">
      <div className="min-w-0">
        <p className="truncate font-semibold">{label}</p>
        <p className="text-[12px] text-white/45">{detail}</p>
      </div>
      <p className="shrink-0 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

const sales = (count: number) => `${formatNumber(count)} ${count === 1 ? "venta" : "ventas"}`;

/** Revenue by kind of package and the best sellers. */
export function ClassFinanceBreakdown({ finance }: { finance: ClassFinance }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <SectionTitle>Por tipo</SectionTitle>
        {finance.byKind.length === 0 ? (
          <p className="text-[13px] text-white/50">Sin ventas.</p>
        ) : (
          <Card padding="none" className="divide-y divide-border">
            {finance.byKind.map((row) => (
              <ListRow
                key={row.kind}
                label={CATALOG_KIND_LABELS[row.kind]}
                detail={sales(row.count)}
                value={formatCents(row.amountCents)}
              />
            ))}
          </Card>
        )}
      </section>
      <section>
        <SectionTitle>Más vendidos</SectionTitle>
        {finance.topPackages.length === 0 ? (
          <p className="text-[13px] text-white/50">Sin ventas.</p>
        ) : (
          <Card padding="none" className="divide-y divide-border">
            {finance.topPackages.map((row) => (
              <ListRow
                key={row.packageId}
                label={row.name}
                detail={sales(row.count)}
                value={formatCents(row.amountCents)}
              />
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
