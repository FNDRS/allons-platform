"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { AllonsLogo } from "@/components/AllonsLogo";
import { isComercioUser } from "@/lib/role";
import { AccountButton, AccountSheet } from "./AccountSheet";
import { useAuth } from "./AuthProvider";
import { useStairsCovering } from "./StairsCover";

export const APP_LINKS = [
  { href: "/eventos", label: "Eventos" },
  { href: "/tickets", label: "Mis tickets" },
  { href: "/comercio", label: "Comercio" },
  { href: "/soporte", label: "Soporte" },
];

const GUEST_HREFS = new Set(["/eventos", "/soporte"]);

/** Guest keeps Soporte. Signed-in users drop it. Comercio only if the JWT says provider. */
export function customerLinksFor(user: User | null) {
  if (!user) return APP_LINKS.filter((link) => GUEST_HREFS.has(link.href));
  return APP_LINKS.filter((link) => {
    if (link.href === "/soporte") return false;
    if (link.href === "/comercio") return isComercioUser(user);
    return true;
  });
}

export function isActivePath(pathname: string, href: string) {
  if (href === "/eventos" || href === "/events") {
    return (
      pathname === "/eventos" ||
      pathname === "/events" ||
      pathname.startsWith("/eventos/") ||
      pathname.startsWith("/events/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Survives AppShell remounts so the dot can travel between pages. */
const navDot = { x: 0, seeded: false };

/** Top bar: logo, links and the account circle. */
export function AppNav() {
  const { user, loading } = useAuth();
  const covering = useStairsCovering();
  const [accountOpen, setAccountOpen] = useState(false);
  const links = loading ? customerLinksFor(null) : customerLinksFor(user);

  if (covering) return <div className="h-16 shrink-0" aria-hidden />;

  return (
    <>
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto grid h-16 w-full max-w-[1120px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:px-8">
          <Link href="/eventos" aria-label="Allons, ir a eventos" className="justify-self-start">
            <AllonsLogo className="h-auto w-[92px]" />
          </Link>

          <NavLinks links={links} />

          <div className="justify-self-end">
            <AccountButton onOpen={() => setAccountOpen(true)} />
          </div>
        </div>
      </header>
      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}

function NavLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [dotX, setDotX] = useState(navDot.x);
  const [dotOn, setDotOn] = useState(navDot.seeded);
  const activeIndex = links.findIndex((link) => isActivePath(pathname, link.href));

  useLayoutEffect(() => {
    const nav = navRef.current;
    const item = itemRefs.current[activeIndex];
    if (!nav || !item || activeIndex < 0) {
      setDotOn(false);
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const box = item.getBoundingClientRect();
    const x = box.left - navBox.left + box.width / 2 - 3;
    if (!navDot.seeded) {
      navDot.seeded = true;
      navDot.x = x;
      setDotX(x);
      setDotOn(true);
      return;
    }
    setDotOn(true);
    setDotX(x);
    navDot.x = x;
  }, [activeIndex, links, pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Principal"
      className="relative flex min-w-0 items-center justify-center gap-0.5"
    >
      {links.map((link, index) => {
        const active = index === activeIndex;
        return (
          <Link
            key={link.href}
            href={link.href}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            aria-current={active ? "page" : undefined}
            className={`relative px-2.5 py-2 text-[13px] font-semibold transition sm:px-4 sm:text-[14px] ${
              active ? "text-white" : "text-muted hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      {dotOn && activeIndex >= 0 ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-0.5 left-0 h-1.5 w-1.5 rounded-full bg-accent"
          initial={false}
          animate={{ x: dotX, opacity: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 30, mass: 0.6 }
          }
        />
      ) : null}
    </nav>
  );
}
