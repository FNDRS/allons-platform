import type { Metadata } from "next";
import { ComercioPageHeader } from "@/components/comercio/ComercioPageHeader";
import { StaffView } from "@/components/comercio/StaffView";

export const metadata: Metadata = {
  title: "Personal · Comercio",
  robots: { index: false, follow: false },
};

export default function StaffPage() {
  return (
    <>
      <ComercioPageHeader
        title="Personal"
        subtitle="Quién puede escanear y administrar tus eventos."
      />
      <StaffView />
    </>
  );
}
