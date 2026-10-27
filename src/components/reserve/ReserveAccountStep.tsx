"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldError, Label } from "@/components/ui/Field";
import { CodeInput } from "@/components/ui/CodeInput";
import { SmoothInput } from "@/components/ui/SmoothInput";
import { GoogleMark } from "@/components/app/LoginForm";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { rememberLoginNext } from "@/lib/login-next";
import { StepHeading } from "./ReserveSections";

function friendlyOtpError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("expired") || lower.includes("invalid"))
    return "El código no es válido o ya venció. Pide uno nuevo.";
  if (lower.includes("rate limit") || lower.includes("security purposes"))
    return "Espera un momento antes de pedir otro código.";
  return message || "Algo salió mal. Intenta de nuevo.";
}

/**
 * Sign-in without leaving the checkout: the buyer gets a code by email and
 * types it here. Works the same for a new email (the account is created) and
 * for an existing one, whether it was made with a password or with Google.
 * Once the session opens, AuthProvider picks it up and the page goes on.
 */
export function ReserveAccountStep({
  step,
  suggestedEmail,
  suggestedName,
  onLeave,
}: {
  step: number;
  suggestedEmail: string;
  suggestedName: string;
  /** Called before the page is left for Google, to keep the form. */
  onLeave: () => void;
}) {
  const [email, setEmail] = useState("");
  // The ticket step already asked for an email; it stays the login email
  // until they say otherwise, so the same question is not asked twice.
  const [otherEmail, setOtherEmail] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"google" | "send" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!otherEmail) setEmail(suggestedEmail);
  }, [suggestedEmail, otherEmail]);
  const reusing = !otherEmail && suggestedEmail.trim().includes("@");

  function useOtherEmail() {
    setOtherEmail(true);
    setEmail("");
    setSentTo(null);
    setError(null);
  }

  async function sendCode(event?: React.FormEvent) {
    event?.preventDefault();
    const target = email.trim().toLowerCase();
    if (!target) {
      setError("Escribe tu correo.");
      return;
    }
    setError(null);
    setBusy("send");
    try {
      const { error: err } = await getSupabaseBrowser().auth.signInWithOtp({
        email: target,
        options: {
          shouldCreateUser: true,
          data: suggestedName.trim()
            ? { full_name: suggestedName.trim() }
            : undefined,
          // The email still carries a link; opened in this browser it lands
          // back on this same checkout.
          emailRedirectTo: window.location.href,
        },
      });
      if (err) throw err;
      setSentTo(target);
      setCode("");
    } catch (err) {
      setError(friendlyOtpError((err as Error).message ?? ""));
    } finally {
      setBusy(null);
    }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (!sentTo) return;
    const token = code.replace(/\D/g, "");
    if (token.length < 6) {
      setError("Escribe el código completo.");
      return;
    }
    setError(null);
    setBusy("verify");
    try {
      const { error: err } = await getSupabaseBrowser().auth.verifyOtp({
        email: sentTo,
        token,
        type: "email",
      });
      if (err) throw err;
      // AuthProvider sees the new session and this step goes away.
    } catch (err) {
      setError(friendlyOtpError((err as Error).message ?? ""));
      setBusy(null);
    }
  }

  async function onGoogle() {
    setError(null);
    setBusy("google");
    try {
      onLeave();
      rememberLoginNext(window.location.pathname + window.location.search);
      const { error: err } = await getSupabaseBrowser().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (err) throw err;
    } catch (err) {
      setError(friendlyOtpError((err as Error).message ?? ""));
      setBusy(null);
    }
  }

  return (
    <section id="reserve-account" data-reserve-account>
      <StepHeading n={step} hint="Ahí guardamos tus tickets">
        Tu cuenta
      </StepHeading>
      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        {sentTo ? (
          <form onSubmit={verify} className="flex flex-col gap-4">
            <p className="text-sm text-white/60">
              Te enviamos un código a{" "}
              <span className="font-semibold text-white">{sentTo}</span>.
              Escríbelo aquí, no hace falta salir de esta página.
            </p>
            <div>
              <Label>Código</Label>
              <CodeInput
                value={code}
                onChange={setCode}
                length={8}
                autoFocus
                invalid={Boolean(error)}
                aria-label="Código de 8 dígitos"
              />
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" size="lg" full loading={busy === "verify"}>
              Confirmar código
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/50">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void sendCode()}
                className="transition-colors hover:text-white disabled:opacity-50"
              >
                Reenviar código
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={useOtherEmail}
                className="transition-colors hover:text-white disabled:opacity-50"
              >
                Usar otro correo
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-white/55">
              {reusing
                ? "Con este correo guardamos tus tickets. Si ya tienes cuenta en Allons con otro, cámbialo aquí."
                : "Si ya tienes cuenta en Allons, usa el mismo correo. Si no, la creamos con este paso."}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              full
              loading={busy === "google"}
              disabled={busy === "send"}
              onClick={() => void onGoogle()}
            >
              <GoogleMark />
              Continuar con Google
            </Button>
            <div className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/35">
              <span className="h-px flex-1 bg-white/10" />o
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <form onSubmit={sendCode} className="flex flex-col gap-4">
              {reusing ? (
                <p className="text-sm text-white/60">
                  Te enviaremos un código a{" "}
                  <span className="font-semibold text-white">
                    {suggestedEmail.trim()}
                  </span>
                  .{" "}
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={useOtherEmail}
                    className="text-white/50 underline underline-offset-4 transition-colors hover:text-white disabled:opacity-50"
                  >
                    Usar otro correo
                  </button>
                </p>
              ) : (
                <label className="block">
                  <Label>Correo</Label>
                  <SmoothInput
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="tu@correo.com"
                    autoFocus={otherEmail}
                    required
                  />
                </label>
              )}
              <FieldError>{error}</FieldError>
              <Button
                type="submit"
                size="lg"
                full
                loading={busy === "send"}
                disabled={busy === "google"}
              >
                Enviarme un código
              </Button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
