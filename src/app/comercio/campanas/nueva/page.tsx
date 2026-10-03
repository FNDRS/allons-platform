import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { CampaignEditor } from "@/components/comercio/campaigns/CampaignEditor";

export const metadata: Metadata = {
  title: "Nueva campaña · Comercio",
  robots: { index: false, follow: false },
};

export default function NewCampaignPage() {
  return (
    <>
      <ComercioPageHeader title="Nueva campaña" />
      <CampaignEditor />
    </>
  );
}
