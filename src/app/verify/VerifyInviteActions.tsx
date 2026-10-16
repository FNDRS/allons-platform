"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Button, buttonClass } from "@/components/ui/Button";
import { isApiError } from "@/lib/api/client";
import { redeemAuthInvite } from "@/lib/api/authInvites";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export type InviteCredential =
  | { kind: "invite"; token: string }
  | { kind: "otp"; tokenHash: string; type: string };

const DEAD_LINK =
  "Este enlace ya se usó o fue reemplazado por uno nuevo. Pide al admin de Allons que reenvíe la invitación.";

/**
 * The invite can be finished on the web or in the app.
 *
 * The token is single use, so it's only redeemed on a tap: a mail scanner
 * that prefetches the page must not burn it. Our own invite token is first
 * traded for a fresh Supabase one, so it doesn't matter how long the mail sat
 * unread. Once redeemed there is a session, and /login in update mode asks
 * for the new password.
 */
export function VerifyInviteActions({
  credential,
  appUrl,
}: {
  credential: InviteCredential;
  appUrl: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueOnWeb() {
    setBusy(true);
    setError(null);
    try {
      const otp =
        credential.kind === "invite"
          ? await redeemAuthInvite(credential.token)
          : { tokenHash: credential.tokenHash, type: credential.type };
      const { error: err } = await getSupabaseBrowser().auth.verifyOtp({
        token_hash: otp.tokenHash,
        type: otp.type as EmailOtpType,
      });
      if (err) throw err;
      router.replace("/login?mode=update&next=/comercio");
    } catch (err) {
      const message = (err as Error).message ?? "";
      const dead = isApiError(err)
        ? err.status === 404 || err.status === 410
        : /expired|invalid/i.test(message);
      setError(dead ? DEAD_LINK : "No se pudo abrir la invitación. Intenta de nuevo.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="lg"
        full
        loading={busy}
        onClick={() => void continueOnWeb()}
        className="mt-8"
      >
        Crear mi contraseña
      </Button>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-amber-300/90">
          {error}
        </p>
      ) : null}
      <a
        href={appUrl}
        className={buttonClass({ variant: "secondary", size: "lg", full: true, className: "mt-3" })}
      >
        Abrir en la app
      </a>
      <p className="mt-6 text-left text-xs leading-5 text-white/45">
        Usa un solo botón: el enlace sirve una vez. Con la contraseña que crees
        entras igual en allonsapp.com y en la app.
      </p>
    </>
  );
}
