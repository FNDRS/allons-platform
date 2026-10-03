import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AppShell } from "@/components/app/AppShell";
import { CampaignPageView } from "@/components/campaigns/CampaignPageView";
import { getPublicCampaign } from "@/lib/allons-api";
import { SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/** One fetch per request, shared by the metadata and the page. */
const loadCampaign = cache(getPublicCampaign);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await loadCampaign(slug);
  // Metadata resolves before the stream starts: an unknown or unpublished
  // campaign still becomes a real 404 here.
  if (!campaign) notFound();

  const path = `/campanas/${encodeURIComponent(campaign.slug)}`;
  const description =
    campaign.description?.trim() ||
    `Eventos de ${campaign.name}, organizada por ${campaign.hub.name}.`;
  const image = campaign.coverImageUrl
    ? { url: campaign.coverImageUrl, alt: campaign.name }
    : { url: `${SITE_URL}/opengraph-image`, alt: campaign.name };

  return {
    title: campaign.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_HN",
      title: campaign.name,
      description,
      url: `${SITE_URL}${path}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: campaign.name,
      description,
      images: [image.url],
    },
  };
}

/** `allonsapp.com/campanas/<slug>`: a published campaign and its events. */
export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  const campaign = await loadCampaign(slug);
  if (!campaign) notFound();

  return (
    <AppShell width="listing">
      <CampaignPageView campaign={campaign} />
    </AppShell>
  );
}
