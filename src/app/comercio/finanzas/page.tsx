import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { FinanceView } from "@/components/comercio/FinanceView";

export const metadata: Metadata = {
  title: "Finanzas · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioFinancePage() {
  return (
    <>
      <ComercioPageHeader title="Finanzas" subtitle="El dinero se deposita después del evento." />
      <FinanceView />
    </>
  );
}
