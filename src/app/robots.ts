import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Public pages are open to every crawler. Account, checkout and panel routes
 * are closed: they show nothing without a session, and an order or ticket URL
 * in an index is a URL someone might try.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/monitoring",
        "/comercio",
        "/tickets",
        "/pagar/",
        "/login",
        "/verify",
        "/events/*/reservar",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
