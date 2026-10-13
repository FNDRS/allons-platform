import { Card, SectionTitle } from "@/components/ui/Card";
import { CLASS_PACKAGE_KIND_LABELS } from "@/hooks/class-program-form/constants";
import { formatHNL } from "@/lib/format";
import type { ClassPackage } from "@/lib/api/providerClassPrograms";
import { packageDetails } from "./classProgramFormat";

/** The program's active packages, read only. */
export function ClassProgramPackagesSummary({ packages }: { packages: ClassPackage[] }) {
  const active = packages
    .filter((item) => item.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <section>
      <SectionTitle>{`Paquetes · ${active.length}`}</SectionTitle>
      {active.length === 0 ? (
        <p className="text-[13px] text-white/50">Este programa no tiene paquetes.</p>
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {active.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{item.name}</p>
                <p className="truncate text-[13px] text-white/50">
                  {CLASS_PACKAGE_KIND_LABELS[item.kind]} · {packageDetails(item)}
                </p>
              </div>
              <p className="shrink-0 text-[14px] font-semibold tabular-nums">
                {item.price > 0 ? formatHNL(item.price) : "Gratis"}
              </p>
            </div>
          ))}
        </Card>
      )}
    </section>
  );
}
