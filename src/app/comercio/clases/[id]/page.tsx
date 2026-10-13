import type { Metadata } from "next";
import { ClassProgramDetailView } from "@/components/comercio/classes/ClassProgramDetailView";

export const metadata: Metadata = {
  title: "Programa de clases · Comercio",
  robots: { index: false, follow: false },
};

export default async function ClassProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassProgramDetailView id={id} />;
}
