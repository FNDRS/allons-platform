import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { EventEditor } from "@/components/comercio/events/EventEditor";

export const metadata: Metadata = {
  title: "Nuevo evento · Comercio",
  robots: { index: false, follow: false },
};

export default function NewComercioEventPage() {
  return (
    <>
      <ComercioPageHeader
        title="Nuevo evento"
        subtitle="Lo revisamos antes de publicarlo. Te avisaremos cuando esté publicado."
      />
      <EventEditor />
    </>
  );
}
