import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { CampaignsView } from "@/components/comercio/campaigns/CampaignsView";

export const metadata: Metadata = {
  title: "Campañas · Comercio",
  robots: { index: false, follow: false },
};

export default function CampaignsPage() {
  return (
    <>
      <ComercioPageHeader
        title="Campañas"
        subtitle="Súmate con tus eventos a campañas como un mes del emprendimiento, o administra las tuyas."
      />
      <CampaignsView />
    </>
  );
}
