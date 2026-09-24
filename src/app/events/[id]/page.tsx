import type { Metadata } from "next";
import { cache } from "react";
import { AppShell } from "@/components/app/AppShell";
import { EventDetailView } from "@/components/events/EventDetailView";
import {
  formatEventWhen,
  getPublicEvent,
  type PublicEvent,
} from "@/lib/allons-api";
import { clip, HONDURAS_KEYWORDS, jsonLd, SITE_URL } from "@/lib/seo";
const DEFAULT_APP_STORE_LINK =
  "https://apps.apple.com/us/app/allons-eventos-honduras/id6780532182?uo=4";

/** Copia de respaldo cuando no se pudo resolver el evento. */
const GENERIC_TITLE = "Evento en Allons";
const GENERIC_DESCRIPTION = "Mira los detalles y compra tu entrada en Allons.";

/** One fetch per request, shared by the metadata and the page. */
const loadEvent = cache(getPublicEvent);

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
  const event = await loadEvent(id);

  const title = event?.title ?? GENERIC_TITLE;
  // Fecha y lugar en la descripción: es lo que decide si alguien abre el enlace.
  const where = [event?.venue, event?.city, event ? "Honduras" : null]
    .filter(Boolean)
    .join(", ");
  const summary = [formatEventWhen(event?.startsAt ?? null), where]
    .filter(Boolean)
    .join(" · ");
  const description = summary
    ? clip(
        event?.description
          ? `${summary}. ${event.description}`
          : `${summary}. Compra tu entrada en línea con Allons.`,
      )
    : GENERIC_DESCRIPTION;

  return {
    title: event
      ? `${event.title}${event.city ? ` en ${event.city}` : ""}: boletos`
      : "Evento",
    description,
    keywords: event
      ? [
          event.title,
          ...(event.city ? [`eventos ${event.city}`, `boletos ${event.city}`] : []),
          ...(event.providerName ? [event.providerName] : []),
          ...HONDURAS_KEYWORDS,
        ]
      : HONDURAS_KEYWORDS,
    alternates: {
      canonical: path,
    },
    // The image comes from events/[id]/opengraph-image so WhatsApp and
    // Instagram get the event banner, not the site card or a raw cover crop.
    openGraph: {
      type: "website",
      locale: "es_HN",
      title,
      description,
      url: `${SITE_URL}${path}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const event = await loadEvent(id);
  return (
    <AppShell width="detail" bottomTabs={false}>
      {isListable(event) ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(eventJsonLd(event))}
        />
      ) : null}
      <EventDetailView
        id={id}
        appDeepLink={buildEventDeepLink(id)}
        appStoreLink={getAppStoreLink()}
      />
    </AppShell>
  );
}

/**
 * Only events still on sale get Event data. An ended one (or a status this
 * page does not know) would tell Google it is scheduled and in stock.
 */
function isListable(event: PublicEvent | null): event is PublicEvent {
  if (!event) return false;
  if (event.status) {
    return event.status === "published" || event.status === "sold_out";
  }
  // No status from the API: fall back to the date.
  const end = Date.parse(event.endsAt ?? event.startsAt ?? "");
  return Number.isFinite(end) && end > Date.now();
}

/**
 * schema.org Event, which is what gets an event into Google's event results
 * for searches like "eventos en Tegucigalpa este fin de semana".
 */
function eventJsonLd(event: PublicEvent) {
  const url = `${SITE_URL}/events/${encodeURIComponent(event.id)}`;
  const availability =
    event.status === "sold_out"
      ? "https://schema.org/SoldOut"
      : "https://schema.org/InStock";
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    url,
    ...(event.description ? { description: clip(event.description, 500) } : {}),
    ...(event.startsAt ? { startDate: event.startsAt } : {}),
    ...(event.endsAt ? { endDate: event.endsAt } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "es-HN",
    image: [event.coverImageUrl ?? `${url}/opengraph-image`],
    location: {
      "@type": "Place",
      name: event.venue ?? event.city ?? "Honduras",
      address: {
        "@type": "PostalAddress",
        ...(event.address ? { streetAddress: event.address } : {}),
        ...(event.city ? { addressLocality: event.city } : {}),
        addressCountry: "HN",
      },
    },
    ...(event.providerName
      ? {
          organizer: {
            "@type": "Organization",
            name: event.providerName,
            ...(event.providerHandle
              ? { url: `${SITE_URL}/${encodeURIComponent(event.providerHandle)}` }
              : {}),
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "HNL",
      ...(event.minPriceCents !== null
        ? { price: (event.minPriceCents / 100).toFixed(2) }
        : {}),
      availability,
    },
  };
}
