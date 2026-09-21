"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { WAITLIST_BASE_SUBSCRIBERS } from "@/lib/waitlist-count";
import { SmoothInput } from "@/components/ui/SmoothInput";

/** The pill draws its own border and fill; the input inside stays bare. */
const BARE_WRAPPER =
  "!rounded-none !border-0 !bg-transparent !px-0 focus-within:!bg-transparent";
const bareField = (dark: boolean) =>
  "!h-full text-base font-medium tracking-tight " +
  (dark
    ? "placeholder:!text-white/35"
    : "!text-black placeholder:!text-black/35");


type Status = "idle" | "loading" | "success" | "error";
type InputStep = "email" | "phone";

interface WaitlistSubmitResponse {
  ok?: boolean;
  duplicate?: boolean;
  totalSubscribers?: number;
  error?: string;
}

interface Props {
  /** Visual style for the form pill. */
  variant?: "light" | "dark";
  /** When true, the email input is shown immediately (no CTA-first step). */
  expanded?: boolean;
  /** Custom CTA label (used in the closed/CTA state). */
  ctaLabel?: string;
  /** Auto-focus input on mount when expanded. */
  autoFocus?: boolean;
}

export function WaitlistForm({
  variant = "dark",
  expanded = false,
  ctaLabel = "Solicitar invitacion",
  autoFocus = false,
}: Props) {
  const params = useSearchParams();
  const source = params.get("src");

  const [step, setStep] = useState<"cta" | "email">(expanded ? "email" : "cta");
  const [inputStep, setInputStep] = useState<InputStep>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTotal, setSuccessTotal] = useState<number>(WAITLIST_BASE_SUBSCRIBERS);
  const [animatedSuccessTotal, setAnimatedSuccessTotal] = useState<number>(WAITLIST_BASE_SUBSCRIBERS);
  const inputRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const successAnimRef = useRef<number | null>(null);

  useEffect(() => {
    if (step === "email" && inputStep === "email" && (autoFocus || !expanded)) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [step, autoFocus, expanded, inputStep]);

  const advanceToPhone = () => {
    setErrorMsg(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Correo inválido");
      return;
    }
    setStatus("idle");
    setInputStep("phone");
    setTimeout(() => phoneRef.current?.focus(), 50);
    saveEmail(trimmed);
  };

  const saveEmail = async (trimmed: string) => {
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data: WaitlistSubmitResponse = await res.json().catch(() => ({}));
      if (res.ok || data?.duplicate) {
        toast.success("Ahora ingresa tu número de teléfono");
      } else {
        toast.error(data?.error || "Error al guardar el correo");
      }
    } catch {
      toast.error("Error al guardar el correo");
    }
  };

  const submit = async () => {
    setErrorMsg(null);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phoneRaw || null;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, phone: trimmedPhone, source }),
      });
      const data: WaitlistSubmitResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Algo salió mal. Inténtalo de nuevo.");
      }
      if (typeof data.totalSubscribers === "number") {
        setSuccessTotal(Math.max(WAITLIST_BASE_SUBSCRIBERS, data.totalSubscribers));
      }
      setStatus("success");
      window.dispatchEvent(
        new CustomEvent("waitlist:signup", {
          detail: {
            email: trimmedEmail,
            duplicate: Boolean(data.duplicate),
            totalSubscribers:
              typeof data.totalSubscribers === "number"
                ? data.totalSubscribers
                : undefined,
          },
        }),
      );
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  useEffect(() => {
    if (status !== "success") return;

    const durationMs = 2400;
    const colors = [
      "#6366F1",
      "#EC4899",
      "#14B8A6",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#A855F7",
      "#EF4444",
      "#FBBF24",
      "#FFFFFF",
    ];

    confetti({
      particleCount: 80,
      spread: 80,
      startVelocity: 34,
      origin: { x: 0.5, y: 0.65 },
      ticks: 220,
      colors,
    });

    const interval = window.setInterval(() => {
      const spread = 75;
      const ticks = 200;
      confetti({
        particleCount: 8,
        angle: 60,
        spread,
        origin: { x: 0, y: 0.6 },
        ticks,
        startVelocity: 26,
        scalar: 1,
        colors,
      });
      confetti({
        particleCount: 8,
        angle: 120,
        spread,
        origin: { x: 1, y: 0.6 },
        ticks,
        startVelocity: 26,
        scalar: 1,
        colors,
      });
    }, 140);

    const timeout = window.setTimeout(() => window.clearInterval(interval), durationMs);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "success") return;
    if (successAnimRef.current) window.cancelAnimationFrame(successAnimRef.current);

    const from = WAITLIST_BASE_SUBSCRIBERS;
    const to = Math.max(WAITLIST_BASE_SUBSCRIBERS, successTotal);
    const durationMs = 1300;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedSuccessTotal(Math.round(from + (to - from) * eased));
      if (t < 1) {
        successAnimRef.current = window.requestAnimationFrame(tick);
      }
    };

    successAnimRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (successAnimRef.current) window.cancelAnimationFrame(successAnimRef.current);
    };
  }, [status, successTotal]);

  const isDark = variant === "dark";

  if (status === "success") {
    return (
      <div className="w-full flex flex-col items-center gap-3 rounded-[28px] border border-emerald-400/30 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.25),rgba(5,15,13,0.75)_42%,rgba(8,8,10,0.98)_100%)] px-4 py-5 shadow-[0_0_0_1px_rgba(16,185,129,0.05),0_20px_80px_-35px_rgba(16,185,129,0.65)]">
        <div
          className={
            "w-full h-14 rounded-full flex items-center justify-center gap-2 backdrop-blur-sm " +
            (isDark
              ? "bg-emerald-500/20 border border-emerald-300/45"
              : "bg-emerald-500/15 border border-emerald-500/35")
          }
        >
          <CheckIcon />
          <span className={"text-sm font-semibold " + (isDark ? "text-white" : "text-black")}>
            Estás dentro
          </span>
        </div>
        <div className="flex flex-col items-center">
          <p
            className={
              "text-[11px] uppercase tracking-[0.22em] " +
              (isDark ? "text-emerald-200/70" : "text-emerald-700/70")
            }
          >
            Personas suscritas
          </p>
          <p
            className={
              "mt-1 text-[30px] font-semibold leading-none tabular-nums " +
              (isDark ? "text-white" : "text-black")
            }
          >
            {animatedSuccessTotal.toLocaleString("es-HN")}
          </p>
        </div>
        <p className={"text-[12px] text-center tracking-wide " + (isDark ? "text-white/60" : "text-black/55")}>
          Te confirmaremos por correo en{" "}
          <span className={"font-medium " + (isDark ? "text-white" : "text-black")}>{email}</span>{" "}
          cuando lancemos.
        </p>
      </div>
    );
  }

  if (step === "cta") {
    return (
      <button
        type="button"
        onClick={() => setStep("email")}
        className={
          "group relative w-full h-14 pl-7 pr-2 rounded-full flex items-center justify-between font-semibold text-base transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] " +
          (isDark
            ? "bg-white text-black shadow-[0_20px_60px_-15px_rgba(255,255,255,0.4)]"
            : "bg-black text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]")
        }
      >
        <span className="relative flex-1 text-center -ml-12 tracking-tight">{ctaLabel}</span>
        <span
          className={
            "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group-hover:translate-x-0.5 " +
            (isDark
              ? "bg-black text-white group-hover:bg-[var(--color-accent)]"
              : "bg-white text-black group-hover:bg-[var(--color-accent)] group-hover:text-white")
          }
        >
          <ArrowIcon />
        </span>
      </button>
    );
  }

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    if (inputStep === "email") {
      advanceToPhone();
    } else {
      submit();
    }
  };

  return (
    <form onSubmit={onFormSubmit} className="w-full flex flex-col items-stretch gap-3">
      <div
        className={
          "relative w-full h-14 rounded-full flex items-center pr-2 pl-6 " +
          (isDark
            ? "bg-transparent border border-white/16"
            : "bg-white border border-black/8 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]")
        }
      >
        {/* Sliding input area */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Email input — slides up when advancing to phone */}
          <div
            className="absolute inset-0 flex items-center transition-all duration-300 ease-in-out"
            style={{
              transform: inputStep === "email" ? "translateY(0)" : "translateY(-120%)",
              opacity: inputStep === "email" ? 1 : 0,
              pointerEvents: inputStep === "email" ? "auto" : "none",
            }}
          >
            <SmoothInput
              ref={inputRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="next"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setErrorMsg(null);
                }
              }}
              wrapperClassName={BARE_WRAPPER}
              className={bareField(isDark)}
            />
          </div>

          {/* Phone input — slides in from below */}
          <div
            className="absolute inset-0 flex items-center transition-all duration-300 ease-in-out"
            style={{
              transform: inputStep === "phone" ? "translateY(0)" : "translateY(120%)",
              opacity: inputStep === "phone" ? 1 : 0,
              pointerEvents: inputStep === "phone" ? "auto" : "none",
            }}
          >
            <SmoothInput
              ref={phoneRef}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="send"
              placeholder="+504 9999 9999"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                setPhoneRaw(digits);
                setPhone(
                  digits.length > 4
                    ? `${digits.slice(0, 4)} ${digits.slice(4)}`
                    : digits,
                );
                if (status === "error") {
                  setStatus("idle");
                  setErrorMsg(null);
                }
              }}
              wrapperClassName={BARE_WRAPPER}
              className={bareField(isDark)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="h-12 px-6 rounded-full bg-[var(--color-accent)] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 active:scale-[0.97] hover:bg-[var(--color-accent-deep)]"
        >
          {status === "loading" ? (
            <Spinner />
          ) : inputStep === "email" ? (
            <ArrowIcon />
          ) : (
            "Unirme"
          )}
        </button>
      </div>

      <div className="flex items-center justify-center min-h-[18px]">
        {errorMsg ? (
          <p className={"text-[11px] tracking-wide " + (isDark ? "text-red-300" : "text-red-500")}>
            {errorMsg}
          </p>
        ) : inputStep === "phone" ? (
          <button
            type="button"
            onClick={() => {
              setInputStep("email");
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className={
              "text-[11px] tracking-[0.15em] uppercase transition-colors " +
              (isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black")
            }
          >
            ← regresar
          </button>
        ) : !expanded ? (
          <button
            type="button"
            onClick={() => setStep("cta")}
            className={
              "text-[11px] tracking-[0.15em] uppercase transition-colors " +
              (isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black")
            }
          >
            ← regresar
          </button>
        ) : (
          <p className={"text-[11px] tracking-wide " + (isDark ? "text-white/45" : "text-black/45")}>
            Sin spam. Solo novedades relevantes de lanzamiento.
          </p>
        )}
      </div>
    </form>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="rgb(16, 185, 129)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
