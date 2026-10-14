import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassesSubNav } from "@/components/comercio/classes/ClassesSubNav";
import { ClassScheduleView } from "@/components/comercio/classes/schedule/ClassScheduleView";

export const metadata: Metadata = {
  title: "Horario de clases · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioClassSchedulePage() {
  return (
    <>
      <ComercioPageHeader title="Clases" subtitle="Las clases de cada semana y quién las imparte." />
      <ClassesSubNav />
      <ClassScheduleView />
    </>
  );
}
