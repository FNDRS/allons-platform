"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type LinkTab = {
  href: string;
  label: string;
  /** Active only on this exact path, not on its children. */
  exact?: boolean;
};

function isActive(pathname: string, tab: LinkTab) {
  return tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

/** Sub-navigation between pages of one section, with the Segmented look. */
export function LinkTabs({ tabs, label }: { tabs: LinkTab[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={label}
      className="mb-5 inline-flex h-11 max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1"
    >
      {tabs.map((tab) => {
        const active = isActive(pathname, tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-full shrink-0 items-center rounded-full px-3 text-[13px] font-semibold transition-colors duration-300 sm:px-4 ${
              active ? "bg-white text-black" : "text-muted hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
