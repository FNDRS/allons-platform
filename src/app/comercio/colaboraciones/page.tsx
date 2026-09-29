import type { Metadata } from "next";
import { CollaborationsView } from "@/components/comercio/CollaborationInvites";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";

export const metadata: Metadata = {
  title: "Colaboraciones · Comercio",
  robots: { index: false, follow: false },
};

export default function CollaborationsPage() {
  return (
    <>
      <ComercioPageHeader
        title="Colaboraciones"
        subtitle="Eventos de otros comercios que compartes, y las invitaciones para unirte."
      />
      <CollaborationsView />
    </>
  );
}
