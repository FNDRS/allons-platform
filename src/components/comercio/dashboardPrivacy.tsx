"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { glassCtaClass } from "@/components/ui/cta";

const KEY = "allons.comercio.hideMoney";

type Privacy = {
  hidden: boolean;
  ready: boolean;
  toggle: () => void;
};

const PrivacyContext = createContext<Privacy | null>(null);

export function DashboardPrivacy({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setHidden(window.localStorage.getItem(KEY) === "1");
    setReady(true);
  }, []);

  function toggle() {
    setHidden((current) => {
      const next = !current;
      window.localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <PrivacyContext.Provider value={{ hidden, ready, toggle }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function useDashboardPrivacy() {
  const value = useContext(PrivacyContext);
  if (!value) {
    throw new Error("useDashboardPrivacy needs DashboardPrivacy");
  }
  return value;
}

export function HideMoneyButton() {
  const { hidden, ready, toggle } = useDashboardPrivacy();
  const concealed = ready && hidden;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      aria-pressed={concealed}
      className={`inline-flex h-8 items-center gap-1.5 px-3 text-[12px] disabled:opacity-60 ${glassCtaClass}`}
    >
      {concealed ? (
        <Eye className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
      ) : (
        <EyeOff className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
      )}
      {concealed ? "Mostrar" : "Ocultar"}
    </button>
  );
}
