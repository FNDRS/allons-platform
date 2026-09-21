import type { Metadata } from "next";
import { ComercioDashboard } from "@/components/comercio/ComercioDashboard";
import { ComercioShell } from "@/components/comercio/ComercioShell";
import { ProviderGate } from "@/components/comercio/ProviderGate";

export const metadata: Metadata = {
  title: "Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioPage() {
  return (
    <ComercioShell title="Resumen" subtitle="Ventas, asistentes y saldo de tus eventos.">
      <ProviderGate>
        <ComercioDashboard />
      </ProviderGate>
    </ComercioShell>
  );
}
