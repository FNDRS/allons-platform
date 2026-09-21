import type { Metadata } from "next";
import { ComercioShell } from "@/components/comercio/ComercioShell";
import { ProviderGate } from "@/components/comercio/ProviderGate";
import { StaffView } from "@/components/comercio/StaffView";

export const metadata: Metadata = {
  title: "Personal · Comercio",
  robots: { index: false, follow: false },
};

export default function StaffPage() {
  return (
    <ProviderGate>
      <ComercioShell title="Personal" subtitle="Quién puede escanear y administrar tus eventos.">
        <StaffView />
      </ComercioShell>
    </ProviderGate>
  );
}
