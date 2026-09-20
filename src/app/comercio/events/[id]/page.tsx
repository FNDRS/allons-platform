import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ComercioEventView } from "@/components/comercio/ComercioEventView";
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
    <AppShell>
      <ProviderGate>
        <ComercioEventView eventId={id} />
      </ProviderGate>
    </AppShell>
  );
}
