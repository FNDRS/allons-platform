import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassesSubNav } from "@/components/comercio/classes/ClassesSubNav";
import { ClassCatalogView } from "@/components/comercio/classes/catalog/ClassCatalogView";

export const metadata: Metadata = {
  title: "Paquetes y membresías · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioClassCatalogPage() {
  return (
    <>
      <ComercioPageHeader
        title="Clases"
        subtitle="Paquetes y membresías que sirven para varios programas."
      />
      <ClassesSubNav />
      <ClassCatalogView />
    </>
  );
}
