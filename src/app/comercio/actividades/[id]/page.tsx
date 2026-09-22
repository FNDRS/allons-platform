import type { Metadata } from "next";
import { ActivityDetailView } from "@/components/comercio/ActivityDetailView";

export const metadata: Metadata = {
  title: "Actividad · Comercio",
  robots: { index: false, follow: false },
};

export default async function ActividadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ActivityDetailView activityId={id} />;
}
