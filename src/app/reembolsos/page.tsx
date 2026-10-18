import type { Metadata } from "next";
import { LegalEntityCard, LegalSections } from "@/components/LegalSections";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_VERSION, REFUND_SECTIONS } from "@/lib/legalCenter";

export const metadata: Metadata = {
  title: "Política de Reembolsos y Cancelaciones",
  description:
    "Cuándo procede un reembolso en Allons y cómo presentar una reclamación.",
  alternates: { canonical: "/reembolsos" },
};

export default function ReembolsosPage() {
  return (
    <LegalPage title="Política de Reembolsos y Cancelaciones" updated={LEGAL_VERSION}>
      <LegalEntityCard />
      <LegalSections sections={REFUND_SECTIONS} />
    </LegalPage>
  );
}
