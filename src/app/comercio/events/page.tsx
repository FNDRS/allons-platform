import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ComercioEventsListView } from "@/components/comercio/ComercioEventsListView";

export const metadata: Metadata = {
  title: "Eventos · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioEventsPage() {
  return (
    <>
      <ComercioPageHeader title="Eventos" subtitle="Entra a un evento para ver sus ventas y finanzas." />
      <ComercioEventsListView />
    </>
  );
}
