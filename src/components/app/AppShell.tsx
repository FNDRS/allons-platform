import { AppNav } from "./AppNav";

/**
 * Frame for every app page (events, tickets, comercio). The landing keeps its
 * own hero and does not use this.
 */
export function AppShell({
  children,
  width = "default",
}: {
  children: React.ReactNode;
  width?: "default" | "narrow";
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#050505] text-white">
      <AppNav />
      <main
        className={`mx-auto w-full flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 ${
          width === "narrow" ? "max-w-2xl" : "max-w-5xl"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
          {title}
        </h1>
        {body ? <p className="mt-2 max-w-xl text-sm text-white/55 sm:text-base">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}
