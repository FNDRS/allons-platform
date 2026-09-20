"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { AllonsLogo } from "@/components/AllonsLogo";
import { displayNameOf, useAuth } from "./AuthProvider";

const LINKS = [
  { href: "/events", label: "Eventos" },
  { href: "/tickets", label: "Mis tickets" },
  { href: "/comercio", label: "Comercio" },
];

export function AppNav() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/events" aria-label="Allons" className="shrink-0">
          <AllonsLogo className="h-auto w-24" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive(link.href)
                  ? "bg-white/[0.1] text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {loading ? null : user ? (
            <>
              <span className="max-w-40 truncate text-sm text-white/60">
                {displayNameOf(user)}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-white/70 hover:bg-white/[0.12]"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:bg-white/90"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="flex size-10 items-center justify-center rounded-full bg-white/[0.06] sm:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/[0.06] px-4 pb-5 pt-3 sm:hidden">
          <nav className="flex flex-col gap-1" aria-label="Principal">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-4 py-3 text-base font-semibold ${
                  isActive(link.href) ? "bg-white/[0.1]" : "text-white/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-white/[0.06] pt-3">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold text-white/70"
              >
                <LogOut className="size-4" /> Cerrar sesión
                <span className="ml-auto truncate text-sm text-white/40">
                  {user.email}
                </span>
              </button>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                onClick={() => setOpen(false)}
                className="block rounded-2xl bg-white px-4 py-3 text-center text-base font-bold text-black"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
