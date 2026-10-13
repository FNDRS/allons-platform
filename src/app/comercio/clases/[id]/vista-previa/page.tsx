import type { Metadata } from "next";
import { ClassProgramPreviewView } from "@/components/comercio/classes/ClassProgramPreviewView";

export const metadata: Metadata = {
  title: "Vista previa de clase · Comercio",
  robots: { index: false, follow: false },
};

export default async function ClassProgramPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassProgramPreviewView id={id} />;
}
