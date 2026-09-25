import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { HubOverviewView } from "@/components/comercio/HubOverviewView";

export const metadata: Metadata = {
  title: "Semana del Emprendimiento · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioHubPage() {
  return (
    <>
      <ComercioPageHeader
        title="Semana del Emprendimiento"
        subtitle="Inscritos y asistencia por comercio."
      />
      <HubOverviewView />
    </>
  );
}
