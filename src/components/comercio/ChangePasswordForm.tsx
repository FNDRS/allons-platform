"use client";

import { useState } from "react";
import { providersOf } from "@/lib/auth-user";
import { toast } from "sonner";
import { useAuth } from "@/components/app/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const MIN_LENGTH = 8;

/** Supabase answers in English; these are the codes a password change can hit. */
const ERRORS: Record<string, string> = {
  invalid_credentials: "La contraseña actual no es correcta.",
  same_password: "La contraseña nueva tiene que ser distinta a la actual.",
  weak_password: `Esa contraseña es muy débil. Usa al menos ${MIN_LENGTH} caracteres, con letras y números.`,
  reauthentication_needed:
    "Por seguridad, cierra sesión y usa “¿Olvidaste tu contraseña?” para cambiarla.",
  over_request_rate_limit: "Demasiados intentos. Espera unos minutos y vuelve a probar.",
};

function messageFor(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  return (code && ERRORS[code]) || "No pudimos cambiar la contraseña. Intenta de nuevo.";
}

/**
 * Lets a signed-in comercio pick a new password. The current one is checked
 * first, so an unattended session cannot be used to take over the account.
 * A Google-only account has no password yet, so it just sets one.
 */
export function ChangePasswordForm() {
  const { user } = useAuth();
  const hasPassword =
    providersOf(user).includes("email") || user?.app_metadata?.provider === "email";

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (next.length < MIN_LENGTH) {
      setError(`La contraseña nueva necesita al menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (next !== confirm) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }
    if (!user?.email) return;

    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      if (hasPassword) {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: current,
        });
        if (err) throw err;
      }
      const { error: err } = await supabase.auth.updateUser({
        password: next,
        data: { mustSetPassword: false, passwordOffered: true },
      });
      if (err) throw err;
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Contraseña actualizada");
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-[560px]">
      <SectionTitle>{hasPassword ? "Cambiar contraseña" : "Crear contraseña"}</SectionTitle>
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <p className="text-sm text-white/60">
            {hasPassword
              ? "La usas para entrar al panel y a la app con "
              : "Entras con Google. Si creas una contraseña, también podrás entrar con "}
            <span className="text-white/80">{user?.email}</span>.
          </p>
          {hasPassword ? (
            <label className="block">
              <Label>Contraseña actual</Label>
              <Input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <Label>Contraseña nueva</Label>
              <Input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
                minLength={MIN_LENGTH}
                required
              />
            </label>
            <label className="block">
              <Label>Repite la contraseña nueva</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_LENGTH}
                required
              />
            </label>
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" loading={busy} className="self-start">
            {hasPassword ? "Cambiar contraseña" : "Crear contraseña"}
          </Button>
        </form>
      </Card>
    </section>
  );
}
