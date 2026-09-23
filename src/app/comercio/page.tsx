import type { Metadata } from "next";
import { ComercioDashboard } from "@/components/comercio/ComercioDashboard";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";

export const metadata: Metadata = {
  title: "Comercio",
  robots: { index: false, follow: false },
};

export default function ComercioPage() {
  return (
    <>
      <ComercioPageHeader title="Dashboard" subtitle="Ventas, asistentes y saldo de tus eventos." />
      <ComercioDashboard />
    </>
  );
}
