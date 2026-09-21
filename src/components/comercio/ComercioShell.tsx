"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, LayoutDashboard, Smartphone, Users, Wallet } from "lucide-react";
import { AllonsLogo } from "@/components/AllonsLogo";
import { useProviderRealtime } from "@/hooks/useProviderRealtime";
import { isComercioUser } from "@/lib/role";
import { useAuth } from "@/components/app/AuthProvider";
import { LiveIndicator, ProviderLiveProvider } from "./ProviderLive";
import { AccountButton, AccountSheet } from "@/components/app/AccountSheet";
import { BottomTabs } from "@/components/app/BottomTabs";
import { isComercioNavActive } from "@/components/app/AppNav";

const NAV = [
  { href: "/comercio", label: "Resumen", Icon: LayoutDashboard, exact: false },
  { href: "/comercio/finanzas", label: "Finanzas", Icon: Wallet, exact: true },
  { href: "/comercio/staff", label: "Personal", Icon: Users, exact: true },
];

const TABS = [
  { href: "/comercio", label: "Resumen", Icon: LayoutDashboard },
  { href: "/comercio/finanzas", label: "Finanzas", Icon: Wallet },
  { href: "/comercio/staff", label: "Personal", Icon: Users },
];

function isNavActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return isComercioNavActive(pathname, href);
}

/**
 * Dashboard frame for the comercio: a fixed sidebar on desktop, a frosted tab
 * bar on phones, and a header with the page title and account control.
 */
export function ComercioShellInner({
  title,
  subtitle,
  children,
}: {
  /** Omit on pages whose content opens with its own heading. */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="app-canvas min-h-dvh text-white lg:flex">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border px-4 pb-6 pt-6 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <Link href="/events" aria-label="Allons, ir a eventos" className="px-3">
          <AllonsLogo className="h-auto w-[92px]" />
        </Link>
        <p className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">
          Comercio
        </p>
        <nav className="mt-2 flex flex-col gap-1" aria-label="Comercio">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = isNavActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-[14px] border px-3 text-[14px] font-semibold transition ${
                  active
                    ? "border-border-strong bg-surface-2 text-white"
                    : "border-transparent text-muted hover:bg-surface hover:text-white"
                }`}
              >
                <Icon className="size-[18px]" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <Link
            href="/events"
            className="flex h-11 items-center gap-3 rounded-[14px] px-3 text-[14px] font-semibold text-muted transition hover:bg-surface hover:text-white"
          >
            <ArrowUpRight className="size-[18px]" aria-hidden />
            Ver como cliente
          </Link>
          <p className="flex items-start gap-3 rounded-[14px] border border-border bg-surface px-3 py-3 text-[12px] leading-relaxed text-dim">
            <Smartphone className="mt-0.5 size-4 shrink-0" aria-hidden />
            Crea y edita eventos desde la app de Allons. Aquí sigues sus ventas.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-40 border-b border-border">
          <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/events" aria-label="Allons, ir a eventos" className="shrink-0 lg:hidden">
              <AllonsLogo className="h-auto w-[84px]" />
            </Link>
            <p className="hidden text-[13px] font-semibold text-dim lg:block">
              allonsapp.com/comercio
            </p>
            <div className="flex items-center gap-3">
              <LiveIndicator />
              <AccountButton onOpen={() => setAccountOpen(true)} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-32 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          {title ? (
            <div className="mb-8">
              <h1 className="text-[30px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[38px]">
                {title}
              </h1>
              {subtitle ? <p className="mt-2 text-[15px] text-muted">{subtitle}</p> : null}
            </div>
          ) : null}
          {children}
        </main>

        <BottomTabs tabs={TABS} />
      </div>
      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  );
}

/**
 * Every comercio page runs inside this, so the realtime channel is opened
 * once per session and its state is shared with whatever is on screen.
 */
export function ComercioShell(props: Parameters<typeof ComercioShellInner>[0]) {
  const { user } = useAuth();
  const state = useProviderRealtime(isComercioUser(user));
  return (
    <ProviderLiveProvider state={state}>
      <ComercioShellInner {...props} />
    </ProviderLiveProvider>
  );
}
