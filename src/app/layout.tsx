import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "@/components/app/Providers";
import { HONDURAS_KEYWORDS, jsonLd, SITE_URL } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // No maximum-scale: people must be able to pinch-zoom (WCAG 1.4.4).
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Next uses this to resolve social image routes to absolute URLs.
  // (Avoids build-time warning when images are relative.)
  applicationName: "Allons",
  referrer: "origin-when-cross-origin",
  creator: "Allons",
  publisher: "Allons",
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  title: {
    default: "Allons: eventos y boletos en Honduras",
    template: "%s | Allons",
  },
  description:
    "Descubre eventos en Honduras y compra tus boletos en línea: conciertos, fiestas, clases y más en Tegucigalpa, San Pedro Sula y todo el país. Tu entrada con QR en la app o en la web.",
  keywords: HONDURAS_KEYWORDS,
  // No site-wide canonical: a child page without its own would inherit it and
  // tell Google it is a duplicate of the home page. Each public page sets one.
  other: {
    "geo.region": "HN",
    "geo.placename": "Honduras",
    "content-language": "es-HN",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "es_HN",
    url: SITE_URL,
    siteName: "Allons",
    title: "Allons: eventos y boletos en Honduras",
    description:
      "Todos los eventos de Honduras en un solo lugar. Compra tu entrada y guarda tu QR.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Allons. Todos tus eventos en un solo lugar.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allons: eventos y boletos en Honduras",
    description: "Todos los eventos de Honduras en un solo lugar.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Allons",
        url: SITE_URL,
        logo: `${SITE_URL}/allons-logo.png`,
        email: "soporte@allonsapp.com",
        areaServed: { "@type": "Country", name: "Honduras" },
        address: { "@type": "PostalAddress", addressCountry: "HN" },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "soporte@allonsapp.com",
          areaServed: "HN",
          availableLanguage: ["es"],
        },
        sameAs: [
          "https://www.instagram.com/allons.hn/",
          "https://www.tiktok.com/@allons.hn?_r=1&_t=ZS-97bZpRR00Up",
          "https://www.linkedin.com/company/allons-app",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Allons",
        alternateName: "Allons Honduras",
        url: SITE_URL,
        inLanguage: "es-HN",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: "Allons",
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "iOS, Android, Web",
        url: SITE_URL,
        inLanguage: "es-HN",
        countriesSupported: "HN",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "HNL",
        },
      },
    ],
  };

  return (
    <html lang="es-HN" className="dark">
      <head>
        <script
          type="application/ld+json"
          // JSON-LD needs a raw string payload.
          dangerouslySetInnerHTML={jsonLd(structuredData)}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster
          position="top-center"
          theme="dark"
          visibleToasts={3}
          gap={10}
          offset="72px"
          toastOptions={{
            className: "font-sans text-[13px] tracking-tight",
            duration: 4000,
            style: {
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              borderRadius: "999px",
              boxShadow: "none",
              padding: "14px 22px",
              color: "rgba(255,255,255,0.65)",
            },
          }}
        />
      </body>
    </html>
  );
}
