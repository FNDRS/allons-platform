import type { Metadata } from "next";
import { ClassClientDetailView } from "@/components/comercio/clients/ClassClientDetailView";

export const metadata: Metadata = {
  title: "Cliente · Comercio",
  robots: { index: false, follow: false },
};

export default async function ComercioClientPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <ClassClientDetailView userId={userId} />;
}
