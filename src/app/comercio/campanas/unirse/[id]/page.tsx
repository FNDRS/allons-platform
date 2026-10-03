import type { Metadata } from "next";
import { CampaignJoinView } from "@/components/comercio/campaigns/CampaignJoinView";

export const metadata: Metadata = {
  title: "Campaña · Comercio",
  robots: { index: false, follow: false },
};

export default async function JoinCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignJoinView id={id} />;
}
