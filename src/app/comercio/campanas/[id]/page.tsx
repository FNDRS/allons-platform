import type { Metadata } from "next";
import { HubCampaignView } from "@/components/comercio/campaigns/HubCampaignView";

export const metadata: Metadata = {
  title: "Campaña · Comercio",
  robots: { index: false, follow: false },
};

export default async function HubCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HubCampaignView id={id} />;
}
