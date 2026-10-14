import { Card, SectionTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Pill";
import type { ClassClientPass, ClassPassSource } from "@/lib/api/classClients";
import { formatShortDate } from "@/lib/format";

const SOURCE_LABELS: Record<ClassPassSource, string> = {
  purchase: "Compra",
  free: "Gratis",
  guest: "Invitación",
  membership: "Membresía",
};

function creditsLabel(pass: ClassClientPass): string {
  if (pass.creditsTotal == null) return `Ilimitado · ${pass.used} reservadas`;
  return `${pass.creditsRemaining ?? 0} de ${pass.creditsTotal} disponibles · ${pass.used} reservadas`;
}

/** Every pass the client holds or held at the comercio. */
export function ClientPassesSection({ passes }: { passes: ClassClientPass[] }) {
  return (
    <section>
      <SectionTitle>{`Pases · ${passes.length}`}</SectionTitle>
      {passes.length === 0 ? (
        <p className="text-[13px] text-white/50">No tiene pases.</p>
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {passes.map((pass) => {
            const expires = formatShortDate(pass.expiresAt);
            return (
              <div key={pass.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold">{pass.packageName ?? "Pase de invitado"}</p>
                  <p className="text-[13px] text-white/55">
                    {[SOURCE_LABELS[pass.source], pass.programTitle ?? "Todas las clases"].join(" · ")}
                  </p>
                  <p className="text-[13px] tabular-nums text-white/55">{creditsLabel(pass)}</p>
                  <p className="text-[12px] text-white/40">{expires ? `Vence ${expires}` : "Sin vencimiento"}</p>
                </div>
                <StatusPill tone={pass.active ? "gray" : "mute"}>{pass.active ? "Activo" : "Inactivo"}</StatusPill>
              </div>
            );
          })}
        </Card>
      )}
    </section>
  );
}
