import { LinkTabs } from "@/components/ui/LinkTabs";

const TABS = [
  { href: "/comercio/clases", label: "Programas", exact: true },
  { href: "/comercio/clases/horario", label: "Horario" },
  { href: "/comercio/clases/coaches", label: "Coaches" },
  { href: "/comercio/clases/paquetes", label: "Paquetes y membresías" },
];

/** Moves between the pages of the classes section. */
export function ClassesSubNav() {
  return <LinkTabs tabs={TABS} label="Clases" />;
}
