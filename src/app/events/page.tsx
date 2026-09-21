import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { EventsBrowser } from "@/components/events/EventsBrowser";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Descubre eventos en Honduras y compra tus entradas en línea con Allons.",
  alternates: { canonical: "/eventos" },
};

export default function EventsPage() {
  return (
    <AppShell width="listing" tone="space">
      <EventsBrowser />
    </AppShell>
  );
}
