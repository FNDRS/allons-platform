"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, HelpCircle, Store, Ticket, type LucideIcon } from "lucide-react";
import { isActivePath, customerLinksFor } from "./AppNav";
import { useAuth } from "./AuthProvider";
import { useStairsCovering } from "./StairsCover";

export type BottomTab = { href: string; label: string; Icon: LucideIcon };

const TABS: BottomTab[] = [
  { href: "/eventos", label: "Eventos", Icon: Compass },
  { href: "/tickets", label: "Tickets", Icon: Ticket },
  { href: "/comercio", label: "Comercio", Icon: Store },
  { href: "/soporte", label: "Soporte", Icon: HelpCircle },
];

/** Phone navigation: a fixed frosted tab bar. Hidden from md up. */
export function BottomTabs({
  hidden = false,
  tabs = TABS,
}: {
  hidden?: boolean;
  tabs?: BottomTab[];
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const covering = useStairsCovering();
  if (hidden || covering) return null;
  const visible =
    tabs !== TABS
      ? tabs
      : TABS.filter((tab) =>
          (loading ? customerLinksFor(null) : customerLinksFor(user)).some(
            (link) => link.href === tab.href,
          ),
        );
  return (
    <nav
      aria-label="Secciones"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[max(env(safe-area-inset-bottom),8px)] md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2">
        {visible.map(({ href, label, Icon }) => {
          const active =
            href === "/comercio"
              ? isActivePath(pathname, href) && !pathname.startsWith("/comercio/staff")
              : isActivePath(pathname, href);
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
