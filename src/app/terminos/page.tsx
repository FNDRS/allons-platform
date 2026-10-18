import type { Metadata } from "next";
import { LegalEntityCard, LegalSections } from "@/components/LegalSections";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_VERSION, TERMS_SECTIONS } from "@/lib/legalCenter";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso y compra de boletos en Allons.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y Condiciones" updated={LEGAL_VERSION}>
      <LegalEntityCard />
      <LegalSections sections={TERMS_SECTIONS} />
    </LegalPage>
  );
}
