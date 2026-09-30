import type { Metadata } from "next";
import { VerifyInviteActions } from "./VerifyInviteActions";

export const metadata: Metadata = {
  title: "Abrir invitación",
  description: "Crea tu contraseña de Allons en la web o en la app.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
};

function buildAppDeepLink(tokenHash: string, type: string) {
  const qs = new URLSearchParams({ token_hash: tokenHash, type });
  return `allons://verify?${qs.toString()}`;
}

export default async function VerifyInvitePage({ searchParams }: Props) {
  const sp = await searchParams;
  const tokenHash = sp.token_hash?.trim() ?? "";
  const type = sp.type?.trim() || "invite";
  const appUrl = tokenHash ? buildAppDeepLink(tokenHash, type) : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#131516] px-6 py-12 text-[#fbfbfb]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1c1b20] p-8 text-center">
        <p className="text-2xl font-bold text-[#f67010]">Allons</p>
        <h1 className="mt-6 text-xl font-semibold">Abre tu invitación</h1>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Crea tu contraseña aquí mismo, o ábrela en la app si ya la tienes instalada.
        </p>

        {appUrl ? (
          <VerifyInviteActions tokenHash={tokenHash} type={type} appUrl={appUrl} />
        ) : (
          <p className="mt-8 text-sm text-amber-300/90">
            Enlace incompleto. Abre de nuevo el correo de invitación o pide al
            admin que reenvíe la invitación.
          </p>
        )}
      </div>
    </main>
  );
}
