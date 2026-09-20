"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/comercio", label: "Resumen" },
  { href: "/comercio/staff", label: "Staff" },
];

export function ComercioNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-2" aria-label="Comercio">
      {TABS.map((tab) => {
        const active =
          tab.href === "/comercio" ? pathname === "/comercio" || pathname.startsWith("/comercio/events") : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active ? "bg-white text-black" : "border border-white/10 text-white/70 hover:bg-white/[0.06]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
