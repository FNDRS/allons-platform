import type { Metadata } from "next";
import { ComercioEventView } from "@/components/comercio/ComercioEventView";

export const metadata: Metadata = {
  title: "Finanzas del evento · Comercio",
  robots: { index: false, follow: false },
};

export default async function ComercioEventFinancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComercioEventView eventId={id} />;
}
