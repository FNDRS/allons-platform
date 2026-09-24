import Link from "next/link";

export const LEGAL_LINKS = [
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
  { href: "/cookies", label: "Cookies" },
  { href: "/seguridad", label: "Seguridad" },
  { href: "/soporte", label: "Soporte" },
  { href: "/eliminar-cuenta", label: "Eliminar cuenta" },
] as const;

/**
 * The policies, one click from every page: the privacy notice and the terms
 * have to be reachable before anyone buys, not only from each other.
 */
export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <footer
      aria-label="Enlaces legales"
      className={`flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted ${className}`}
    >
      <span>© 2026 Allons · Honduras</span>
      {LEGAL_LINKS.map((link) => (
        <span key={link.href} className="flex gap-x-2">
          <span aria-hidden>·</span>
          <Link href={link.href} className="text-muted hover:text-fg">
            {link.label}
          </Link>
        </span>
      ))}
    </footer>
  );
}
