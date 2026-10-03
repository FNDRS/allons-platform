import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { CampaignEditor } from "@/components/comercio/campaigns/CampaignEditor";

export const metadata: Metadata = {
  title: "Editar campaña · Comercio",
  robots: { index: false, follow: false },
};

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <ComercioPageHeader title="Editar campaña" />
      <CampaignEditor id={id} />
    </>
  );
}
