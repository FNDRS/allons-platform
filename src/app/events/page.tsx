import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { EventsBrowser } from "@/components/events/EventsBrowser";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Descubre eventos en Honduras y compra tus entradas en línea con Allons.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Explora"
        title="Eventos"
        body="Compra tus entradas aquí mismo. Tu ticket queda en tu cuenta y también en la app."
      />
      <EventsBrowser />
    </AppShell>
  );
}
