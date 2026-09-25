"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  LayoutDashboard,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react";
import { AllonsLogo } from "@/components/AllonsLogo";
import { useProviderRealtime } from "@/hooks/useProviderRealtime";
import { isComercioUser, isHubUser } from "@/lib/role";
import { useAuth } from "@/components/app/AuthProvider";
import { ProviderLiveProvider } from "./ProviderLive";
import { AccountButton, AccountSheet } from "@/components/app/AccountSheet";
import { BottomTabs } from "@/components/app/BottomTabs";
import { isComercioNavActive } from "@/components/app/AppNav";
import { PageTransition } from "@/components/app/PageTransition";

/**
 * A Hub comercio (la Semana del Emprendimiento) sees registrations across its
 * campaign instead of Finanzas — most of those events are never monetized.
 */
function buildNav(isHub: boolean) {
  return [
    { href: "/comercio", label: "Dashboard", Icon: LayoutDashboard, exact: false },
    {
      href: "/comercio/actividades",
      label: "Actividades",
      Icon: Activity,
      exact: false,
    },
    ...(isHub
      ? [
          {
            href: "/comercio/hub",
            label: "Semana del Emprendimiento",
            Icon: Users,
            exact: true,
          },
        ]
      : [
          {
            href: "/comercio/finanzas",
            label: "Finanzas",
            Icon: Wallet,
            exact: true,
          },
        ]),
    { href: "/comercio/staff", label: "Personal", Icon: Users, exact: true },
  ];
}

function buildTabs(isHub: boolean) {
  return [
    { href: "/comercio", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/comercio/actividades", label: "Actividad", Icon: Activity },
    ...(isHub
      ? [{ href: "/comercio/hub", label: "Hub", Icon: Users }]
      : [{ href: "/comercio/finanzas", label: "Finanzas", Icon: Wallet }]),
    { href: "/comercio/staff", label: "Personal", Icon: Users },
  ];
}

function isNavActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return isComercioNavActive(pathname, href);
}

/**
 * Dashboard frame for the comercio: a fixed sidebar on desktop, a frosted tab
 * bar on phones, and a header with the account control. Pages render their
 * own heading (see `ComercioPageHeader`).
 */
export function ComercioShellInner({
  children,
  isHub = false,
}: {
  children: React.ReactNode;
  isHub?: boolean;
}) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const nav = buildNav(isHub);
  const tabs = buildTabs(isHub);

  return (
    <div className="app-canvas min-h-dvh text-white lg:flex">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border px-4 pb-6 pt-6 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <Link href="/events" aria-label="Allons, ir a eventos" className="px-3">
          <AllonsLogo className="h-auto w-[92px]" variant="orange" />
        </Link>
        <p className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">
          Comercio
        </p>
        <nav className="mt-2 flex flex-col gap-1" aria-label="Comercio">
          {nav.map(({ href, label, Icon, exact }) => {
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
        <header className="glass sticky top-0 z-40 border-b border-border pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-12 w-full max-w-[1200px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
            <Link
              href="/events"
              aria-label="Allons, ir a eventos"
              className="min-w-0 shrink-0 lg:hidden"
            >
              <AllonsLogo
                className="h-auto w-[72px] sm:w-[84px]"
                variant="orange"
              />
            </Link>
            <p className="hidden min-w-0 truncate text-[13px] font-semibold text-dim lg:block">
              allonsapp.com/comercio
            </p>
            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
              <AccountButton onOpen={() => setAccountOpen(true)} />
            </div>
          </div>
        </header>

        <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 pt-4 sm:px-6 md:pb-8 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>

        <BottomTabs tabs={tabs} />
      </div>
      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  );
}

/**
 * Mounted once by the comercio layout, so the realtime channel is opened
 * once per session and its state is shared with whatever page is on screen.
 */
export function ComercioShell(
  props: Omit<Parameters<typeof ComercioShellInner>[0], "isHub">,
) {
  const { user } = useAuth();
  const state = useProviderRealtime(isComercioUser(user));
  return (
    <ProviderLiveProvider state={state}>
      <ComercioShellInner {...props} isHub={isHubUser(user)} />
    </ProviderLiveProvider>
  );
}
