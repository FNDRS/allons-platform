import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassProgramEditor } from "@/components/comercio/classes/ClassProgramEditor";

export const metadata: Metadata = {
  title: "Editar programa · Comercio",
  robots: { index: false, follow: false },
};

export default async function EditClassProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <ComercioPageHeader title="Editar programa" />
      <ClassProgramEditor id={id} />
    </>
  );
}
