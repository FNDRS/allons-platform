import type { Metadata } from "next";
import { ThreeDsVerify } from "@/components/pay/ThreeDsVerify";

export const metadata: Metadata = {
  title: "Verificación del banco",
  robots: { index: false, follow: false },
};

export default async function ThreeDsVerifyPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <ThreeDsVerify orderId={orderId} />;
}
