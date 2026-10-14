import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassesSubNav } from "@/components/comercio/classes/ClassesSubNav";
import { ClassCoachesView } from "@/components/comercio/classes/coaches/ClassCoachesView";

export const metadata: Metadata = {
  title: "Coaches · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioClassCoachesPage() {
  return (
    <>
      <ComercioPageHeader title="Clases" subtitle="Tu equipo de coaches, para asignarlos a cada horario." />
      <ClassesSubNav />
      <ClassCoachesView />
    </>
  );
}
