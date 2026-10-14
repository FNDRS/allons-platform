import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassSalesView } from "@/components/comercio/class-finance/ClassSalesView";
import { FinanceTabs } from "@/components/comercio/class-finance/FinanceTabs";

export const metadata: Metadata = {
  title: "Contabilidad · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioClassSalesPage() {
  return (
    <>
      <ComercioPageHeader title="Finanzas" subtitle="Cada venta de clases, con su comprobante." />
      <FinanceTabs />
      <ClassSalesView />
    </>
  );
}
