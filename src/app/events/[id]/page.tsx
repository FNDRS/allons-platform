import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { EventDetailView } from "@/components/events/EventDetailView";
import { formatEventWhen, getPublicEvent } from "@/lib/allons-api";

const SITE_URL = "https://allonsapp.com";
const DEFAULT_APP_STORE_LINK =
  "https://apps.apple.com/us/app/allons-eventos-honduras/id6780532182?uo=4";

/** Copia de respaldo cuando no se pudo resolver el evento. */
const GENERIC_TITLE = "Evento en Allons";
const GENERIC_DESCRIPTION = "Mira los detalles y compra tu entrada en Allons.";

type Props = {
  params: Promise<{ id: string }>;
};

function buildEventDeepLink(eventId: string) {
  return `allons://events/${encodeURIComponent(eventId)}`;
}

function getAppStoreLink() {
  return process.env.APP_STORE_LINK?.trim() || DEFAULT_APP_STORE_LINK;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const path = `/events/${encodeURIComponent(id)}`;
  const event = await getPublicEvent(id);

  const title = event?.title ?? GENERIC_TITLE;
  // Fecha y lugar en la descripción: es lo que decide si alguien abre el enlace.
  const description =
    [formatEventWhen(event?.startsAt ?? null), event?.city]
      .filter(Boolean)
      .join(" · ") || GENERIC_DESCRIPTION;

  const image = event?.coverImageUrl
    ? { url: event.coverImageUrl, alt: event.title }
    : {
        url: `${SITE_URL}/opengraph-image`,
        alt: "Allons Eventos sin fricción",
      };

  return {
    title: event ? event.title : "Evento",
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      images: [{ ...image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

/**
 * The event page. Also the target of shared links and App Links: with the
 * app installed the OS opens it there; without it, this page sells the
 * ticket on the web and still offers the app.
 */
export default async function EventPage({ params }: Props) {
  const { id } = await params;
  return (
    <AppShell width="detail" bottomTabs={false}>
      <EventDetailView
        id={id}
        appDeepLink={buildEventDeepLink(id)}
        appStoreLink={getAppStoreLink()}
      />
    </AppShell>
  );
}
