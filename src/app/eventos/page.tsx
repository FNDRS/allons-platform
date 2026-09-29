import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { EventsBrowser } from "@/components/events/EventsBrowser";
import { HONDURAS_KEYWORDS, SITE_URL } from "@/lib/seo";

const TITLE = "Eventos en Honduras: conciertos, fiestas y clases";
const DESCRIPTION =
  "Descubre qué hacer en Honduras: eventos en Tegucigalpa, San Pedro Sula, La Ceiba, Roatán y todo el país. Compra tus boletos en línea con Allons y entra con tu QR.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: HONDURAS_KEYWORDS,
  alternates: { canonical: "/eventos" },
  openGraph: {
    type: "website",
    locale: "es_HN",
    url: `${SITE_URL}/eventos`,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
};

export default function EventsPage() {
  return (
    <AppShell width="listing" tone="space" cover>
      <EventsBrowser />
    </AppShell>
  );
}
