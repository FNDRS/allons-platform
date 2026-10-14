import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassFinanceView } from "@/components/comercio/class-finance/ClassFinanceView";
import { FinanceTabs } from "@/components/comercio/class-finance/FinanceTabs";

export const metadata: Metadata = {
  title: "Finanzas de clases · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioClassFinancePage() {
  return (
    <>
      <ComercioPageHeader title="Finanzas" subtitle="Ventas de paquetes, membresías y clases." />
      <FinanceTabs />
      <ClassFinanceView />
    </>
  );
}
