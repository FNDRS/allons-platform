import type { MetadataRoute } from "next";
import { listPublicEvents } from "@/lib/allons-api";
import { listPublicClassProgramIds } from "@/lib/classPrograms.server";
import { SITE_URL } from "@/lib/seo";

/** Rebuilt hourly, so a newly published event is findable the same day. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const legalPaths = [
    "/privacidad",
    "/terminos",
    "/cookies",
    "/seguridad",
    "/soporte",
    "/eliminar-cuenta",
  ];

  const [events, classProgramIds] = await Promise.all([
    listPublicEvents(),
    listPublicClassProgramIds(),
  ]);
  const now = Date.now();

  return [
    {
      // `/` redirects here; the sitemap lists the canonical URL.
      url: `${SITE_URL}/eventos`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...events.map((event) => {
      const upcoming = !event.startsAt || new Date(event.startsAt).getTime() >= now;
      return {
        url: `${SITE_URL}/eventos/${encodeURIComponent(event.id)}`,
        lastModified,
        changeFrequency: upcoming ? ("daily" as const) : ("monthly" as const),
        priority: upcoming ? 0.8 : 0.4,
      };
    }),
    ...classProgramIds.map((id) => ({
      url: `${SITE_URL}/clases/${encodeURIComponent(id)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...legalPaths.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
