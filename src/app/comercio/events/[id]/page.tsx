import type { Metadata } from "next";
import { ComercioEventView } from "@/components/comercio/ComercioEventView";
import { ComercioShell } from "@/components/comercio/ComercioShell";
import { ProviderGate } from "@/components/comercio/ProviderGate";

export const metadata: Metadata = {
  title: "Evento · Comercio",
  robots: { index: false, follow: false },
};

export default async function ComercioEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ProviderGate>
      <ComercioShell title="Evento" subtitle="Ventas, asistentes y unidades de este evento.">
        <ComercioEventView eventId={id} />
      </ComercioShell>
    </ProviderGate>
  );
}
