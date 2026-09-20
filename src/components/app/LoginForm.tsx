"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "./AuthProvider";

type Mode = "login" | "signup" | "reset" | "update";

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (lower.includes("email not confirmed"))
    return "Confirma tu correo antes de entrar. Revisa tu bandeja.";
  if (lower.includes("user already registered"))
    return "Ese correo ya tiene cuenta. Inicia sesión.";
  if (lower.includes("password should be at least"))
    return "La contraseña necesita al menos 6 caracteres.";
  if (lower.includes("rate limit"))
    return "Demasiados intentos. Espera un momento.";
  return message || "Algo salió mal. Intenta de nuevo.";
}

/** Only a same-origin path: no protocol-relative, no backslash tricks. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || /[\\\s]/.test(raw)) {
    return "/events";
  }
  try {
    const url = new URL(raw, "https://allonsapp.com");
    if (url.origin !== "https://allonsapp.com") return "/events";
    return url.pathname + url.search;
  } catch {
    return "/events";
  }
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // A recovery link lands here with a session already open. Supabase raises
  // PASSWORD_RECOVERY for it; switch to the new-password form instead of
  // bouncing the user straight into the app with the old password.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("update");
    }
    let supabase: ReturnType<typeof getSupabaseBrowser>;
    try {
      supabase = getSupabaseBrowser();
    } catch {
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && user && mode !== "update") router.replace(next);
  }, [loading, user, router, next, mode]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        router.replace(next);
        return;
      }
      if (mode === "signup") {
        if (!name.trim()) {
          setError("Escribe tu nombre.");
          return;
        }
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (err) throw err;
        if (data.session) {
          router.replace(next);
        } else {
          setNotice(
            "Te enviamos un correo para confirmar tu cuenta. Al confirmarlo podrás entrar.",
          );
          setMode("login");
        }
        return;
      }
      if (mode === "update") {
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) throw err;
        toast.success("Contraseña actualizada");
        setPassword("");
        router.replace(next);
        return;
      }
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/login` },
      );
      if (err) throw err;
      toast.success("Revisa tu correo para cambiar la contraseña.");
      setMode("login");
    } catch (err) {
      setError(friendlyAuthError((err as Error).message ?? ""));
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "login"
      ? "Entra a Allons"
      : mode === "signup"
        ? "Crea tu cuenta"
        : mode === "update"
          ? "Elige una nueva contraseña"
          : "Recupera tu contraseña";

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
        {mode === "signup" ? "Nuevo en Allons" : "Bienvenido"}
      </p>
      <h1 className="mt-2 text-4xl font-semibold leading-none tracking-[-0.05em]">
        {title}
      </h1>
      <p className="mt-3 text-sm text-white/55">
        {mode === "reset"
          ? "Te enviaremos un enlace para elegir una nueva contraseña."
          : mode === "update"
            ? "Escribe la contraseña que usarás desde ahora, en la web y en la app."
            : "Usa la misma cuenta que en la app. Tus tickets se ven en los dos lados."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        {mode === "signup" ? (
          <label className="block">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="Tu nombre"
              required
            />
          </label>
        ) : null}
        {mode !== "update" ? (
        <label className="block">
          <Label>Correo</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="tu@correo.com"
            inputMode="email"
            required
          />
        </label>
        ) : null}
        {mode !== "reset" ? (
          <label className="block">
            <Label>{mode === "update" ? "Nueva contraseña" : "Contraseña"}</Label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </label>
        ) : null}

        <FieldError>{error}</FieldError>
        {notice ? (
          <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {notice}
          </p>
        ) : null}

        <Button type="submit" size="lg" full loading={busy}>
          {mode === "login"
            ? "Entrar"
            : mode === "signup"
              ? "Crear cuenta"
              : mode === "update"
                ? "Guardar contraseña"
                : "Enviar enlace"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-white/55">
        {mode === "login" ? (
          <>
            <button
              type="button"
              className="hover:text-white"
              onClick={() => setMode("reset")}
            >
              Olvidé mi contraseña
            </button>
            <p>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                className="font-semibold text-accent"
                onClick={() => setMode("signup")}
              >
                Crear una
              </button>
            </p>
          </>
        ) : (
          <button
            type="button"
            className="hover:text-white"
            onClick={() => setMode("login")}
          >
            Ya tengo cuenta, entrar
          </button>
        )}
      </div>
    </div>
  );
}
