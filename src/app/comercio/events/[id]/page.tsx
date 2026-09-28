import type { Metadata } from "next";
import { EventConfigView } from "@/components/comercio/EventConfigView";

export const metadata: Metadata = {
  title: "Evento · Comercio",
  robots: { index: false, follow: false },
};

export default async function ComercioEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventConfigView eventId={id} />;
}
