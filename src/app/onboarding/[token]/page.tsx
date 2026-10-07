import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { OnboardingOutcome } from "@/components/onboarding/OnboardingOutcome";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { getOnboardingSession } from "@/lib/allons-api";

type Props = { params: Promise<{ token: string }> };

/** Una consulta por request, compartida por la metadata y la página. */
const loadSession = cache(getOnboardingSession);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  // Aquí todavía se puede responder 404 de verdad, antes de que empiece el stream.
  if ((await loadSession(token)).status === "invalid") notFound();
  return {
    title: "Registro de comercio",
    robots: { index: false, follow: false },
  };
}

/**
 * `allonsapp.com/onboarding/<token>`: el registro de un comercio nuevo.
 * Sólo existe para quien recibió el enlace desde el panel de Allons; un
 * token desconocido, vencido o revocado es un 404 como cualquier otro.
 */
export default async function OnboardingPage({ params }: Props) {
  const { token } = await params;
  const result = await loadSession(token);
  if (result.status === "invalid") notFound();

  return (
    <OnboardingFrame>
      {result.status === "ok" ? (
        <OnboardingWizard token={token} session={result.session} />
      ) : (
        <OnboardingOutcome kind={result.status} />
      )}
    </OnboardingFrame>
  );
}
