import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "@/components/app/Providers";

const SITE_URL = "https://allonsapp.com";

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
    default: "Allons Eventos sin fricción",
    template: "%s Allons",
  },
  description:
    "Allons es la plataforma para gestionar, vender y controlar entradas de eventos en Honduras. Únete a la lista de espera.",
  keywords: [
    "Allons",
    "eventos Honduras",
    "ticketing Honduras",
    "venta de entradas",
    "boletos",
    "QR",
    "lista de espera",
    "Tegucigalpa",
    "San Pedro Sula",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "es-HN": "/",
      es: "/",
    },
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
    title: "Allons Eventos sin fricción",
    description:
      "Únete a la lista de espera. Próximamente en Honduras y Latinoamérica.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Allons Eventos sin fricción",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allons Eventos sin fricción",
    description: "Únete a la lista de espera.",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Allons",
        url: SITE_URL,
        sameAs: [
          "https://www.instagram.com/allons.hn/",
          "https://www.tiktok.com/@allons.hn?_r=1&_t=ZS-97bZpRR00Up",
          "https://www.linkedin.com/company/allons-app",
        ],
      },
      {
        "@type": "WebSite",
        name: "Allons",
        url: SITE_URL,
        inLanguage: "es-HN",
      },
      {
        "@type": "SoftwareApplication",
        name: "Allons",
        applicationCategory: "BusinessApplication",
        operatingSystem: "iOS, Android, Web",
        url: SITE_URL,
        inLanguage: "es-HN",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          // JSON-LD needs a raw string payload.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
          closeButton
          visibleToasts={3}
          gap={10}
          offset="72px"
          toastOptions={{
            className: "font-sans text-sm tracking-tight",
            duration: 4000,
            style: {
              background: "rgba(20,20,22,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              borderRadius: "14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              padding: "14px 16px",
            },
          }}
        />
      </body>
    </html>
  );
}
