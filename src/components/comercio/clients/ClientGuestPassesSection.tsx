import { Card, SectionTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Pill";
import type { ClassGuestPass } from "@/lib/api/classClients";
import { formatShortDate } from "@/lib/format";

const STATUS_LABELS: Record<ClassGuestPass["status"], string> = {
  pending: "Sin usar",
  redeemed: "Usada",
  revoked: "Anulada",
};

/** Invitations the client gave from their membership. */
export function ClientGuestPassesSection({ guestPasses }: { guestPasses: ClassGuestPass[] }) {
  if (guestPasses.length === 0) return null;
  return (
    <section>
      <SectionTitle>{`Invitados · ${guestPasses.length}`}</SectionTitle>
      <Card padding="none" className="divide-y divide-border">
        {guestPasses.map((pass) => (
          <div key={pass.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{pass.guestName ?? "Aún sin invitado"}</p>
              <p className="text-[13px] tabular-nums text-white/55">
                {pass.status === "redeemed"
                  ? `${pass.code} · usada el ${formatShortDate(pass.redeemedAt) ?? ""}`
                  : `${pass.code} · vence ${formatShortDate(pass.expiresAt) ?? ""}`}
              </p>
            </div>
            <StatusPill tone={pass.status === "pending" ? "gray" : "mute"}>{STATUS_LABELS[pass.status]}</StatusPill>
          </div>
        ))}
      </Card>
    </section>
  );
}
