import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { TicketsList } from "@/components/tickets/TicketsList";

export const metadata: Metadata = {
  title: "Mis tickets",
  robots: { index: false, follow: false },
};

export default function TicketsPage() {
  return (
    <AppShell width="narrow">
      <PageHeader
        eyebrow="Tu cuenta"
        title="Mis tickets"
        body="Muestra el QR o el código en la entrada."
      />
      <TicketsList />
    </AppShell>
  );
}
