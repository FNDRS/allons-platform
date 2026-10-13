import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AppShell } from "@/components/app/AppShell";
import { ClassProgramView } from "@/components/classes/ClassProgramView";
import { getPublicClassProgramMeta } from "@/lib/classPrograms.server";
import { clip, HONDURAS_KEYWORDS, SITE_URL } from "@/lib/seo";

/** Copy used when the class could not be loaded on the server. */
const GENERIC_TITLE = "Clase en Allons";
const GENERIC_DESCRIPTION = "Mira los paquetes y reserva tu clase en Allons.";

type Props = { params: Promise<{ id: string }> };

/** One fetch per request, shared by the metadata and the page. */
const loadProgram = cache(getPublicClassProgramMeta);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lookup = await loadProgram(id);
  // Metadata resolves before the stream starts, so an unknown or unpublished
  // class still answers with a real 404 status.
  if (lookup.status === "missing") notFound();
  // The API did not answer: generic metadata, and the page loads the class itself.
  if (lookup.status === "unavailable") {
    return {
      title: GENERIC_TITLE,
      description: GENERIC_DESCRIPTION,
      alternates: { canonical: `/clases/${encodeURIComponent(id)}` },
    };
  }
  const { program } = lookup;

  const path = `/clases/${encodeURIComponent(program.id)}`;
  const where = [program.locationName, program.city].filter(Boolean).join(", ");
  const description = clip(
    program.description ??
      [program.discipline, where, "Compra tu paquete y reserva en línea con Allons."]
        .filter(Boolean)
        .join(". "),
  );
  const images = program.coverImageUrl
    ? [{ url: program.coverImageUrl, alt: program.title }]
    : [{ url: `${SITE_URL}/opengraph-image`, alt: "Allons" }];

  return {
    title: `${program.title}${program.city ? ` en ${program.city}` : ""}: clases`,
    description,
    keywords: [
      program.title,
      ...(program.discipline ? [program.discipline] : []),
      ...(program.city ? [`clases ${program.city}`] : []),
      ...HONDURAS_KEYWORDS,
    ],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_HN",
      title: program.title,
      description,
      url: `${SITE_URL}${path}`,
      images,
    },
    twitter: { card: "summary_large_image", title: program.title, description },
  };
}

/** A recurring class: its packages, and the week's sessions to book. */
export default async function ClassProgramPage({ params }: Props) {
  const { id } = await params;
  const lookup = await loadProgram(id);
  if (lookup.status === "missing") notFound();
  return (
    <AppShell width="detail" bottomTabs={false}>
      <ClassProgramView programId={id} />
    </AppShell>
  );
}
