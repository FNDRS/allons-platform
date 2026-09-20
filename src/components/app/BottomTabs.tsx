"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Store, Ticket } from "lucide-react";
import { isActivePath } from "./AppNav";

const TABS = [
  { href: "/events", label: "Eventos", Icon: Compass },
  { href: "/tickets", label: "Tickets", Icon: Ticket },
  { href: "/comercio", label: "Comercio", Icon: Store },
];

/** Phone navigation: a fixed frosted tab bar. Hidden from md up. */
export function BottomTabs({ hidden = false }: { hidden?: boolean }) {
  const pathname = usePathname();
  if (hidden) return null;
  return (
    <nav
      aria-label="Secciones"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[max(env(safe-area-inset-bottom),8px)] md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[11px] font-semibold transition ${
                active ? "text-white" : "text-dim hover:text-muted"
              }`}
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-full transition ${
                  active ? "bg-accent-soft text-accent" : ""
                }`}
              >
                <Icon className="size-[18px]" aria-hidden />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
