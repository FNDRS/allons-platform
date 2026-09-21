import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { TicketsList } from "@/components/tickets/TicketsList";

export const metadata: Metadata = {
  title: "Mis tickets",
  robots: { index: false, follow: false },
};

export default function TicketsPage() {
  return (
    <AppShell width="listing" tone="space">
      <TicketsList />
    </AppShell>
  );
}
