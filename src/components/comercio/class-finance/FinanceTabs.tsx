import { LinkTabs } from "@/components/ui/LinkTabs";

const TABS = [
  { href: "/comercio/finanzas", label: "Eventos", exact: true },
  { href: "/comercio/finanzas/clases", label: "Clases", exact: true },
  { href: "/comercio/finanzas/clases/ventas", label: "Contabilidad" },
];

/** Moves between events finance, classes finance and the class sales ledger. */
export function FinanceTabs() {
  return <LinkTabs tabs={TABS} label="Finanzas" />;
}
