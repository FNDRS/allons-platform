import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ClassClientsView } from "@/components/comercio/clients/ClassClientsView";

export const metadata: Metadata = {
  title: "Clientes · Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioClientsPage() {
  return (
    <>
      <ComercioPageHeader title="Clientes" subtitle="Quienes compran y reservan tus clases." />
      <ClassClientsView />
    </>
  );
}
