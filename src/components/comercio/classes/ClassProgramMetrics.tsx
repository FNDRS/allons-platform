import { Stat } from "@/components/ui/Stat";
import { formatHNL, formatNumber } from "@/lib/format";
import type { ProviderClassProgramMetrics } from "@/lib/api/providerClassPrograms";

/** Sold sessions, revenue, average occupancy and upcoming reservations. */
export function ClassProgramMetrics({ metrics }: { metrics: ProviderClassProgramMetrics }) {
  const occupancy =
    metrics.avgOccupancy == null ? "-" : `${Math.round(metrics.avgOccupancy * 100)}%`;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat label="Vendidas" value={formatNumber(metrics.soldSessions)} />
      <Stat label="Ingresos" value={formatHNL(metrics.revenueCents / 100)} />
      <Stat label="Ocupación" value={occupancy} />
      <Stat label="Próximas" value={formatNumber(metrics.upcomingReservations)} />
    </div>
  );
}
