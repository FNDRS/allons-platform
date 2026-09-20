import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { ComercioDashboard } from "@/components/comercio/ComercioDashboard";
import { ComercioNav } from "@/components/comercio/ComercioNav";
import { ProviderGate } from "@/components/comercio/ProviderGate";

export const metadata: Metadata = {
  title: "Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Comercio" title="Resumen" body="Ventas, asistentes y staff de tus eventos." />
      <ComercioNav />
      <ProviderGate>
        <ComercioDashboard />
      </ProviderGate>
    </AppShell>
  );
}
