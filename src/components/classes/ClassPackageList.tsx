import type { ClassPackage } from "@/lib/api/classPrograms";
import { SectionTitle } from "@/components/ui/Card";
import { ClassPackageCard } from "./ClassPackageCard";

/** Every active package of the program, cheapest decision first. */
export function ClassPackageList({
  packages,
  hasSessions,
  claimingPackageId,
  onChoose,
}: {
  packages: ClassPackage[];
  hasSessions: boolean;
  claimingPackageId: string | null;
  onChoose: (item: ClassPackage) => void;
}) {
  if (packages.length === 0) {
    return (
      <section>
        <SectionTitle>Paquetes</SectionTitle>
        <p className="text-[14px] text-white/50">
          El comercio aún no ofrece paquetes para esta clase.
        </p>
      </section>
    );
  }
  const spentFreeClaim =
    !hasSessions && packages.some((item) => item.claimed && Number(item.price) <= 0);
  const hasPaid = packages.some((item) => Number(item.price) > 0);

  return (
    <section id="paquetes" className="scroll-mt-24">
      <SectionTitle>Paquetes</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {packages.map((item) => (
          <ClassPackageCard
            key={item.id}
            item={item}
            hasSessions={hasSessions}
            busy={claimingPackageId === item.id}
            disabled={claimingPackageId !== null}
            onChoose={() => onChoose(item)}
          />
        ))}
      </div>
      {spentFreeClaim ? (
        <p className="mt-3 text-[13px] text-white/50">
          {hasPaid
            ? "Ya usaste tu clase gratis. Elige un paquete para seguir agendando."
            : "Ya usaste tu clase gratis y el comercio aún no ofrece paquetes de pago."}
        </p>
      ) : null}
    </section>
  );
}
