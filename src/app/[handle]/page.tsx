import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AppShell } from "@/components/app/AppShell";
import { ComercioProfileView } from "@/components/comercios/ComercioProfileView";
import { getPublicComercio } from "@/lib/allons-api";

const SITE_URL = "https://allonsapp.com";
const DEFAULT_APP_STORE_LINK =
  "https://apps.apple.com/us/app/allons-eventos-honduras/id6780532182?uo=4";

type Props = { params: Promise<{ handle: string }> };

/** One fetch per request, shared by the metadata and the page. */
const loadComercio = cache(getPublicComercio);

function getAppStoreLink() {
  return process.env.APP_STORE_LINK?.trim() || DEFAULT_APP_STORE_LINK;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const profile = await loadComercio(handle);
  // Metadata resolves before the stream starts, so this is where an unknown
  // handle can still turn into a real 404 status instead of a 200 shell.
  if (!profile) notFound();

  const path = `/${encodeURIComponent(profile.handle ?? profile.id)}`;
  const description =
    profile.description?.trim() ||
    [profile.city, `${profile.eventCount} eventos en Allons`].filter(Boolean).join(" · ");
  const image = profile.logoUrl
    ? { url: profile.logoUrl, alt: profile.name }
    : { url: `${SITE_URL}/opengraph-image`, alt: "Allons Eventos sin fricción" };

  return {
    title: profile.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "profile",
      title: profile.name,
      description,
      url: `${SITE_URL}${path}`,
      images: [image],
    },
    twitter: { card: "summary", title: profile.name, description, images: [image.url] },
  };
}

/**
 * `allonsapp.com/<handle>`: the comercio as a customer sees it. Static
 * routes (eventos, tickets, login…) win over this segment, and anything that
 * is not a known handle falls through to the 404 page.
 */
export default async function ComercioPublicPage({ params }: Props) {
  const { handle } = await params;
  const profile = await loadComercio(handle);
  if (!profile) notFound();

  return (
    <AppShell width="listing">
      <ComercioProfileView
        profile={profile}
        appDeepLink={`allons://comercio/${encodeURIComponent(profile.id)}`}
        appStoreLink={getAppStoreLink()}
      />
    </AppShell>
  );
}
