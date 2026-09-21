import Link from "next/link";
import { AppNav } from "./app/AppNav";

interface Props {
  title: string;
  /** Short line under the title (e.g. last-updated date or subtitle). */
  updated?: string;
  children: React.ReactNode;
}

/**
 * Shared shell for static legal / support pages (privacy, terms, support,
 * account deletion). Keeps brand header, container and footer consistent.
 */
export function LegalPage({ title, updated, children }: Props) {
  return (
    <div className="app-canvas min-h-dvh text-white">
      <AppNav />
      <main className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-24 pt-8">
        <h1 className="text-3xl font-extrabold leading-tight">{title}</h1>
        {updated ? (
          <p className="mt-2 text-sm text-muted">{updated}</p>
        ) : null}

        <div className="legal-prose mt-8">{children}</div>

        <footer className="mt-14 border-t border-border pt-6 text-sm text-muted">
          © 2026 Allons ·{" "}
          <Link href="/privacidad" className="text-muted hover:text-fg">
            Privacidad
          </Link>{" "}
          ·{" "}
          <Link href="/terminos" className="text-muted hover:text-fg">
            Términos
          </Link>{" "}
          ·{" "}
          <Link href="/soporte" className="text-muted hover:text-fg">
            Soporte
          </Link>{" "}
          ·{" "}
          <Link href="/eliminar-cuenta" className="text-muted hover:text-fg">
            Eliminar cuenta
          </Link>
        </footer>
      </main>
    </div>
  );
}
