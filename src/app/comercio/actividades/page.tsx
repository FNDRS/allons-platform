import type { Metadata } from "next";
import { ActivitiesView } from "@/components/comercio/ActivitiesView";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";

export const metadata: Metadata = {
  title: "Actividades · Comercio",
  robots: { index: false, follow: false },
};

export default function ActividadesPage() {
  return (
    <>
      <ComercioPageHeader
        title="Actividades"
        subtitle="Cada venta, escaneo y cambio, con su detalle."
      />
      <ActivitiesView />
    </>
  );
}
