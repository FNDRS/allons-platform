import { AppNav } from "./app/AppNav";
import { LegalLinks } from "./app/LegalLinks";
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
      <main id="contenido" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        <PageTransition>
          <h1 className="break-words text-3xl font-extrabold leading-tight">{title}</h1>
          {updated ? (
            <p className="mt-2 text-sm text-muted">{updated}</p>
          ) : null}

          <div className="legal-prose mt-8">{children}</div>

          <LegalLinks className="mt-14 border-t border-border pt-6" />
        </PageTransition>
      </main>
    </div>
  );
}
