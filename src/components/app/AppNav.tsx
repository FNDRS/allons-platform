"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AllonsLogo } from "@/components/AllonsLogo";
import { AccountButton, AccountSheet } from "./AccountSheet";

export const APP_LINKS = [
  { href: "/events", label: "Eventos" },
  { href: "/tickets", label: "Mis tickets" },
  { href: "/comercio", label: "Comercio" },
];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Top bar: logo, links (desktop) and the account circle. */
export function AppNav() {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/events" aria-label="Allons, ir a eventos" className="shrink-0">
          <AllonsLogo className="h-auto w-[92px]" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {APP_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[14px] font-semibold transition ${
                  active
                    ? "border border-border-strong bg-surface-2 text-white"
                    : "text-muted hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <AccountButton onOpen={() => setAccountOpen(true)} />
      </div>
      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </header>
  );
}
