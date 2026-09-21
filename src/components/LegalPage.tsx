import Link from "next/link";
import { AppNav } from "./app/AppNav";
import { PageTransition } from "./app/PageTransition";

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
      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        <PageTransition>
          <h1 className="break-words text-3xl font-extrabold leading-tight">{title}</h1>
          {updated ? (
            <p className="mt-2 text-sm text-muted">{updated}</p>
          ) : null}

          <div className="legal-prose mt-8">{children}</div>

          <footer className="mt-14 flex flex-wrap gap-x-2 gap-y-1 border-t border-border pt-6 text-sm text-muted">
            <span>© 2026 Allons</span>
            <span aria-hidden>·</span>
            <Link href="/privacidad" className="text-muted hover:text-fg">
              Privacidad
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terminos" className="text-muted hover:text-fg">
              Términos
            </Link>
            <span aria-hidden>·</span>
            <Link href="/soporte" className="text-muted hover:text-fg">
              Soporte
            </Link>
            <span aria-hidden>·</span>
            <Link href="/eliminar-cuenta" className="text-muted hover:text-fg">
              Eliminar cuenta
            </Link>
          </footer>
        </PageTransition>
      </main>
    </div>
  );
}
