import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { ScannerView } from "@/components/comercio/scanner/ScannerView";

export const metadata: Metadata = {
  title: "Escanear · Comercio",
  robots: { index: false, follow: false },
};

export default function ScannerPage() {
  return (
    <>
      <ComercioPageHeader
        title="Escanear"
        subtitle="Valida tickets en la entrada con el código o la cámara."
      />
      <ScannerView />
    </>
  );
}
