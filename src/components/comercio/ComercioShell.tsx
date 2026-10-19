"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Dumbbell,
  Flag,
  Handshake,
  KeyRound,
  LayoutDashboard,
  ScanLine,
  Smartphone,
  Tag,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { AllonsLogo } from "@/components/AllonsLogo";
import { NewBadge } from "@/components/ui/NewBadge";
import { useComercioPublicPage } from "@/hooks/useComercioPublicPage";
import { useProviderRealtime } from "@/hooks/useProviderRealtime";
import { isComercioUser, isScannerOnlyUser, SCANNER_PATH } from "@/lib/role";
import { useAuth } from "@/components/app/AuthProvider";
import { ProviderLiveProvider } from "./ProviderLive";
import { AccountButton, AccountSheet } from "@/components/app/AccountSheet";
import { BottomTabs, SCANNER_TABS } from "@/components/app/BottomTabs";
import { isComercioNavActive } from "@/components/app/AppNav";
import { PageTransition } from "@/components/app/PageTransition";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof Flag;
  exact: boolean;
  /** Freshly shipped: shows the NEW badge. */
  isNew?: boolean;
};

const NAV: NavItem[] = [
  { href: "/comercio", label: "Dashboard", Icon: LayoutDashboard, exact: false },
  {
    href: "/comercio/events",
    label: "Eventos",
    Icon: CalendarDays,
    exact: false,
  },
  {
    href: "/comercio/clases",
    label: "Clases",
    Icon: Dumbbell,
    exact: false,
  },
  {
    href: "/comercio/clientes",
    label: "Clientes",
    Icon: UserRound,
    exact: false,
  },
  {
    href: "/comercio/actividades",
    label: "Actividades",
    Icon: Activity,
    exact: false,
  },
  {
    href: "/comercio/finanzas",
    label: "Finanzas",
    Icon: Wallet,
    exact: false,
  },
  {
    href: "/comercio/descuentos",
    label: "Descuentos",
    Icon: Tag,
    exact: true,
  },
  {
    href: "/comercio/colaboraciones",
    label: "Colaboraciones",
    Icon: Handshake,
    exact: true,
  },
  {
    href: "/comercio/campanas",
    label: "Campañas",
    Icon: Flag,
    exact: false,
    isNew: true,
  },
  { href: "/comercio/staff", label: "Personal", Icon: Users, exact: true },
  {
    href: SCANNER_PATH,
    label: "Escanear",
    Icon: ScanLine,
    exact: true,
    isNew: true,
  },
  {
    href: "/comercio/cuenta",
    label: "Cuenta",
    Icon: KeyRound,
    exact: true,
    isNew: true,
  },
];

/** Door staff only have the scanner, so the sidebar shows just that. */
const SCANNER_NAV = NAV.filter((item) => item.href === SCANNER_PATH);

/** The phone bar keeps the four sections used most; the rest go under "Más". */
const TAB_HREFS = [
  "/comercio",
  "/comercio/events",
  "/comercio/descuentos",
  "/comercio/finanzas",
];
const TABS = TAB_HREFS.map((href) => NAV.find((item) => item.href === href)!);
const MORE = NAV.filter((item) => !TAB_HREFS.includes(item.href));

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
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const publicPage = useComercioPublicPage();
  const { user } = useAuth();
  const scannerOnly = isScannerOnlyUser(user);
  const nav = scannerOnly ? SCANNER_NAV : NAV;

  return (
    <div className="app-canvas min-h-dvh text-white lg:flex">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border px-4 pb-6 pt-6 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <Link href="/eventos" aria-label="Allons, ir a eventos" className="px-3">
          <AllonsLogo className="h-auto w-[92px]" variant="orange" />
        </Link>
        <p className="mt-2 truncate px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-dim">
          Comercios
        </p>
        <nav className="mt-2 flex flex-col gap-1" aria-label="Comercio">
          {nav.map(({ href, label, Icon, exact, isNew }) => {
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
                {isNew ? <NewBadge className="ml-auto" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <Link
            href="/eventos"
            className="flex h-11 items-center gap-3 rounded-[14px] px-3 text-[14px] font-semibold text-muted transition hover:bg-surface hover:text-white"
          >
            <ArrowUpRight className="size-[18px]" aria-hidden />
            Ver como cliente
          </Link>
          {scannerOnly ? null : (
            <p className="flex items-start gap-3 rounded-[14px] border border-border bg-surface px-3 py-3 text-[12px] leading-relaxed text-dim">
              <Smartphone className="mt-0.5 size-4 shrink-0" aria-hidden />
              Crea y edita eventos desde la app de Allons. Aquí sigues sus ventas.
            </p>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-[var(--outage-h,0px)] z-40 border-b border-border pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-12 w-full max-w-[1200px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
            <Link
              href="/eventos"
              aria-label="Allons, ir a eventos"
              className="min-w-0 shrink-0 lg:hidden"
            >
              <AllonsLogo
                className="h-auto w-[72px] sm:w-[84px]"
                variant="orange"
              />
            </Link>
            {publicPage ? (
              <Link
                href={publicPage.href}
                className="hidden min-w-0 truncate text-[13px] font-semibold text-dim transition hover:text-white lg:block"
                title="Ver tu página pública"
              >
                {publicPage.label}
              </Link>
            ) : (
              <p className="hidden min-w-0 truncate text-[13px] font-semibold text-dim lg:block">
                allonsapp.com
              </p>
            )}
            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
              <AccountButton onOpen={() => setAccountOpen(true)} />
            </div>
          </div>
        </header>

        <main id="contenido" tabIndex={-1} className="mx-auto w-full min-w-0 max-w-[1200px] flex-1 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>

        {scannerOnly ? (
          <BottomTabs tabs={SCANNER_TABS} hideFrom="lg" />
        ) : (
          <BottomTabs tabs={TABS} more={MORE} hideFrom="lg" />
        )}
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
  props: Parameters<typeof ComercioShellInner>[0],
) {
  const { user } = useAuth();
  const state = useProviderRealtime(isComercioUser(user));
  return (
    <ProviderLiveProvider state={state}>
      <ComercioShellInner {...props} />
    </ProviderLiveProvider>
  );
}
