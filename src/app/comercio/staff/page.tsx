import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { ComercioNav } from "@/components/comercio/ComercioNav";
import { ProviderGate } from "@/components/comercio/ProviderGate";
import { StaffView } from "@/components/comercio/StaffView";

export const metadata: Metadata = {
  title: "Staff · Comercio",
  robots: { index: false, follow: false },
};

export default function StaffPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Comercio" title="Staff" body="Quién puede escanear y administrar tus eventos." />
      <ComercioNav />
      <ProviderGate>
        <StaffView />
      </ProviderGate>
    </AppShell>
  );
}
