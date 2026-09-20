import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ReserveView } from "@/components/reserve/ReserveView";

export const metadata: Metadata = {
  title: "Reservar",
  robots: { index: false, follow: false },
};

export default async function ReservePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell width="narrow">
      <ReserveView eventId={id} />
    </AppShell>
  );
}
