import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { TicketDetailView } from "@/components/tickets/TicketDetailView";

export const metadata: Metadata = {
  title: "Tu ticket",
  robots: { index: false, follow: false },
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell width="narrow">
      <Suspense fallback={null}>
        <TicketDetailView ticketId={id} />
      </Suspense>
    </AppShell>
  );
}
