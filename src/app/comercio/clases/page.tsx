import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassProgramsView } from "@/components/comercio/classes/ClassProgramsView";
import { ClassesSubNav } from "@/components/comercio/classes/ClassesSubNav";

export const metadata: Metadata = {
  title: "Clases · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioClassesPage() {
  return (
    <>
      <ComercioPageHeader
        title="Clases"
        subtitle="Programas con horarios semanales y paquetes de sesiones."
      />
      <ClassesSubNav />
      <ClassProgramsView />
    </>
  );
}
