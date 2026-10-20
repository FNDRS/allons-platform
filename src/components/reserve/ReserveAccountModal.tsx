"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldError, Label } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { SmoothInput } from "@/components/ui/SmoothInput";
import { GoogleMark } from "@/components/app/LoginForm";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { rememberLoginNext } from "@/lib/login-next";

function friendlyOtpError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("expired") || lower.includes("invalid"))
    return "El código no es válido o ya venció. Pide uno nuevo.";
  if (lower.includes("rate limit") || lower.includes("security purposes"))
    return "Espera un momento antes de pedir otro código.";
  return message || "Algo salió mal. Intenta de nuevo.";
}

/**
 * Sign-in asked for at the moment of reserving, on top of the filled form,
 * and only on events whose comercio wants every purchase on an account. The
 * buyer gets a code by email and types it here, or continues with Google;
 * either way they land back on this same checkout with everything they
 * typed still in place. Works the same for a new email (the account is
 * created) and for an existing one, whether it was made with a password or
 * with Google. Once the session opens, AuthProvider picks it up and the
 * checkout goes on.
 */
export function ReserveAccountModal({
  open,
  onClose,
  suggestedEmail,
  suggestedName,
  onLeave,
  onName,
}: {
  open: boolean;
  onClose: () => void;
  suggestedEmail: string;
  suggestedName: string;
  /** Called before the page is left for Google, to keep the form. */
  onLeave: () => void;
  /** The name typed with the code, for the ticket and the new account. */
  onName?: (name: string) => void;
}) {
  const [email, setEmail] = useState("");
  // Asked with the code only when the form has no name yet: the code
  // sign-up has no other place to learn it, and the ticket needs one.
  const [name, setName] = useState("");
  const askName = suggestedName.trim().length < 2;
  const [emailTouched, setEmailTouched] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"google" | "send" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The buyer step already asked for an email; reuse it until they type here.
  useEffect(() => {
    if (!emailTouched) setEmail(suggestedEmail);
  }, [suggestedEmail, emailTouched]);

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
          data: suggestedName.trim() ? { full_name: suggestedName.trim() } : undefined,
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
    const typedName = name.trim().replace(/\s+/g, " ");
    if (askName && typedName.length < 2) {
      setError("Escribe tu nombre: va en tu ticket.");
      return;
    }
    setError(null);
    setBusy("verify");
    try {
      const supabase = getSupabaseBrowser();
      const { error: err } = await supabase.auth.verifyOtp({
        email: sentTo,
        token,
        type: "email",
      });
      if (err) throw err;
      if (askName && typedName) {
        // Best effort: the ticket gets the name either way through onName.
        await supabase.auth
          .updateUser({ data: { full_name: typedName } })
          .catch(() => null);
        onName?.(typedName);
      }
      // AuthProvider sees the new session; the checkout closes this modal.
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
    <Modal open={open} onClose={onClose} title="Tu cuenta">
      <p className="text-[14px] leading-6 text-white/55">
        Este evento guarda tus tickets en una cuenta de Allons. Entra o créala
        aquí; tu reserva sigue tal como la dejaste.
      </p>
      <div className="mt-5">
        {sentTo ? (
          <form onSubmit={verify} className="flex flex-col gap-4">
            <p className="text-sm text-white/60">
              Te enviamos un código a{" "}
              <span className="font-semibold text-white">{sentTo}</span>. Escríbelo
              aquí, no hace falta salir de esta página.
            </p>
            {askName ? (
              <label className="block">
                <Label>Tu nombre</Label>
                <SmoothInput
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  autoCapitalize="words"
                  placeholder="Nombre y apellido"
                />
              </label>
            ) : null}
            <label className="block">
              <Label>Código</Label>
              <SmoothInput
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 8))
                }
                autoComplete="one-time-code"
                inputMode="numeric"
                placeholder="123456"
                autoFocus={!askName}
                className="tracking-[0.4em]"
              />
            </label>
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
                onClick={() => {
                  setSentTo(null);
                  setError(null);
                }}
                className="transition-colors hover:text-white disabled:opacity-50"
              >
                Usar otro correo
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
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
              <label className="block">
                <Label>Correo</Label>
                <SmoothInput
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmailTouched(true);
                    setEmail(event.target.value);
                  }}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@correo.com"
                  required
                />
              </label>
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
              <p className="text-center text-[12px] leading-5 text-white/35">
                Si ya tienes cuenta, usa el mismo correo. Si no, la creamos con
                este paso.
              </p>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}
