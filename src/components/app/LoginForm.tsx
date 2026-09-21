"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FieldError, Label } from "@/components/ui/Field";
import { SmoothInput } from "@/components/ui/SmoothInput";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "./AuthProvider";

type Mode = "login" | "signup" | "reset" | "update";

const NEXT_STORAGE_KEY = "allons.login.next";
/** A reset link older than this is stale; forget where it was going. */
const NEXT_TTL_MS = 60 * 60 * 1000;

/**
 * The recovery email opens in a fresh tab, so the destination has to live in
 * localStorage (sessionStorage is per tab). Stored only once Supabase accepted
 * the reset request, and read at most once.
 */
function rememberNext(next: string) {
  try {
    window.localStorage.setItem(NEXT_STORAGE_KEY, JSON.stringify({ next, at: Date.now() }));
  } catch {
    /* the user simply lands on /events after the reset */
  }
}

function takeRememberedNext(): string | null {
  try {
    const raw = window.localStorage.getItem(NEXT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { next?: unknown; at?: unknown };
    if (typeof parsed.next !== "string" || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > NEXT_TTL_MS) {
      window.localStorage.removeItem(NEXT_STORAGE_KEY);
      return null;
    }
    return parsed.next;
  } catch {
    return null;
  }
}

function forgetNext() {
  try {
    window.localStorage.removeItem(NEXT_STORAGE_KEY);
  } catch {
    /* nothing to clean */
  }
}

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos. Si en la app entras con Google, usa Continuar con Google.";
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
  const [storedNext, setStoredNext] = useState<string | null>(null);
  const next = params.get("next") ? safeNext(params.get("next")) : storedNext ?? "/events";
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"google" | "form" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // A recovery link lands here with a session already open. Supabase raises
  // PASSWORD_RECOVERY for it; switch to the new-password form instead of
  // bouncing the user straight into the app with the old password.
  useEffect(() => {
    // Only a recovery landing consumes the remembered destination; an
    // ordinary visit to /login must never be redirected by it.
    const recovering = window.location.hash.includes("type=recovery");
    if (recovering) {
      setMode("update");
      const saved = takeRememberedNext();
      if (saved && !params.get("next")) setStoredNext(safeNext(saved));
    }
    let supabase: ReturnType<typeof getSupabaseBrowser>;
    try {
      supabase = getSupabaseBrowser();
    } catch {
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "PASSWORD_RECOVERY") return;
      setMode("update");
      const saved = takeRememberedNext();
      if (saved && !params.get("next")) setStoredNext(safeNext(saved));
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
    setBusy("form");
    try {
      const supabase = getSupabaseBrowser();
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
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
          email: email.trim().toLowerCase(),
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
        forgetNext();
        router.replace(next);
        return;
      }
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/login` },
      );
      if (err) throw err;
      // Persist only once the request went through, so a failed attempt
      // cannot leave a stale destination behind for a later login.
      rememberNext(next);
      toast.success("Revisa tu correo para cambiar la contraseña.");
      setMode("login");
    } catch (err) {
      setError(friendlyAuthError((err as Error).message ?? ""));
    } finally {
      setBusy(null);
    }
  }

  async function onGoogle() {
    setError(null);
    setNotice(null);
    setBusy("google");
    try {
      const supabase = getSupabaseBrowser();
      const redirect = new URL("/login", window.location.origin);
      if (next && next !== "/events") redirect.searchParams.set("next", next);
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirect.toString() },
      });
      if (err) throw err;
    } catch (err) {
      setError(friendlyAuthError((err as Error).message ?? ""));
      setBusy(null);
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
      {mode === "signup" ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Nuevo en Allons
        </p>
      ) : null}
      <h1
        className={`text-4xl font-semibold leading-none tracking-[-0.05em] ${
          mode === "signup" ? "mt-2" : ""
        }`}
      >
        {title}
      </h1>
      <p className="mt-3 text-sm text-white/55">
        {mode === "reset"
          ? "Te enviaremos un enlace para elegir una nueva contraseña."
          : mode === "update"
            ? "Escribe la contraseña que usarás desde ahora, en la web y en la app."
            : "Usa la misma cuenta que en la app. Tus tickets se ven en los dos lados."}
      </p>

      {mode === "login" || mode === "signup" ? (
        <div className="mt-8">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            full
            loading={busy === "google"}
            disabled={busy === "form"}
            onClick={() => void onGoogle()}
            className="!duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <GoogleMark />
            Continuar con Google
          </Button>
          <div className="my-5 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            o
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className={`flex flex-col gap-4 ${mode === "login" || mode === "signup" ? "" : "mt-8"}`}
      >
        {mode === "signup" ? (
          <label className="block">
            <Label>Nombre</Label>
            <SmoothInput
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
          <SmoothInput
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
            <SmoothInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Mínimo 6 caracteres"
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

        <Button
          type="submit"
          size="lg"
          full
          loading={busy === "form"}
          disabled={busy === "google"}
          className="!duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_12px_48px_rgba(246,112,16,0.32)] active:!duration-500 active:scale-[0.99]"
        >
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
              className="transition-colors duration-700 ease-out hover:text-white"
              onClick={() => setMode("reset")}
            >
              Olvidé mi contraseña
            </button>
            <p>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                className="font-semibold text-accent transition-colors duration-700 ease-out hover:text-[#ff9a4a]"
                onClick={() => setMode("signup")}
              >
                Crear una
              </button>
            </p>
          </>
        ) : (
          <button
            type="button"
            className="transition-colors duration-700 ease-out hover:text-white"
            onClick={() => setMode("login")}
          >
            Ya tengo cuenta, entrar
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
