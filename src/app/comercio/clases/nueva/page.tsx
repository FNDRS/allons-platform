import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassProgramEditor } from "@/components/comercio/classes/ClassProgramEditor";

export const metadata: Metadata = {
  title: "Nuevo programa · Comercio",
  robots: { index: false, follow: false },
};

export default function NewClassProgramPage() {
  return (
    <>
      <ComercioPageHeader title="Nuevo programa de clases" />
      <ClassProgramEditor />
    </>
  );
}
