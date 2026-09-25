import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { DiscountsView } from "@/components/comercio/DiscountsView";

export const metadata: Metadata = {
  title: "Descuentos · Comercio",
  robots: { index: false, follow: false },
};

export default function DiscountsPage() {
  return (
    <>
      <ComercioPageHeader
        title="Descuentos"
        subtitle="Crea códigos promocionales que rebajan el precio en el checkout."
      />
      <DiscountsView />
    </>
  );
}
