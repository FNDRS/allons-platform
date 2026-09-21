import type { Metadata } from "next";
import { ComercioShell } from "@/components/comercio/ComercioShell";
import { FinanceView } from "@/components/comercio/FinanceView";
import { ProviderGate } from "@/components/comercio/ProviderGate";

export const metadata: Metadata = {
  title: "Finanzas · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioFinancePage() {
  return (
    <ProviderGate>
      <ComercioShell title="Finanzas" subtitle="Tu saldo y lo que se retiene por venta.">
        <FinanceView />
      </ComercioShell>
    </ProviderGate>
  );
}
