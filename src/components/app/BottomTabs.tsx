"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  Ellipsis,
  HelpCircle,
  Store,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { isActivePath, isComercioNavActive, customerLinksFor } from "./AppNav";
import { useAuth } from "./AuthProvider";
import { useStairsCovering } from "./StairsCover";

export type BottomTab = { href: string; label: string; Icon: LucideIcon };

const TABS: BottomTab[] = [
  { href: "/eventos", label: "Eventos", Icon: Compass },
  { href: "/tickets", label: "Tickets", Icon: Ticket },
  { href: "/comercio", label: "Comercio", Icon: Store },
  { href: "/soporte", label: "Soporte", Icon: HelpCircle },
];

const tabClass = (active: boolean) =>
  `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-center text-[10px] font-semibold leading-tight transition sm:px-2 sm:text-[11px] ${
    active ? "text-white" : "text-dim hover:text-muted"
  }`;

function TabIcon({ Icon, active }: { Icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={`flex h-8 w-12 items-center justify-center rounded-full transition ${
        active ? "bg-accent-soft text-accent" : ""
      }`}
    >
      <Icon className="size-[18px]" aria-hidden />
    </span>
  );
}

/**
 * Phone navigation: a fixed frosted tab bar. Hidden from md up, or from lg
 * where the page only gets its sidebar at lg. `more` adds a "Más" tab that
 * opens a sheet with the sections that don't fit in the bar.
 */
export function BottomTabs({
  hidden = false,
  tabs = TABS,
  more = [],
  hideFrom = "md",
}: {
  hidden?: boolean;
  tabs?: BottomTab[];
  more?: BottomTab[];
  hideFrom?: "md" | "lg";
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const covering = useStairsCovering();
  const [moreOpen, setMoreOpen] = useState(false);
  if (hidden || covering) return null;
  const visible =
    tabs !== TABS
      ? tabs
      : TABS.filter((tab) =>
          (loading ? customerLinksFor(null) : customerLinksFor(user)).some(
            (link) => link.href === tab.href,
          ),
        );
  const moreActive = more.some(({ href }) => isComercioNavActive(pathname, href));
  return (
    <nav
      aria-label="Secciones"
      className={`glass fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[max(env(safe-area-inset-bottom),8px)] ${
        hideFrom === "lg" ? "lg:hidden" : "md:hidden"
      }`}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2">
        {visible.map(({ href, label, Icon }) => {
          const active = isComercioNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={tabClass(active)}
            >
              <TabIcon Icon={Icon} active={active} />
              {label}
            </Link>
          );
        })}
        {more.length > 0 ? (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(true)}
            className={tabClass(moreActive)}
          >
            <TabIcon Icon={Ellipsis} active={moreActive} />
            Más
          </button>
        ) : null}
      </div>
      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Más secciones">
        <div className="flex flex-col gap-1 px-3 pb-4">
          {more.map(({ href, label, Icon }) => {
            const active = isComercioNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex h-12 items-center gap-3 rounded-[14px] px-3 text-[15px] font-semibold transition ${
                  active ? "bg-surface-2 text-white" : "text-muted hover:bg-surface hover:text-white"
                }`}
              >
                <Icon className="size-[18px]" aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
      </Modal>
    </nav>
  );
}
