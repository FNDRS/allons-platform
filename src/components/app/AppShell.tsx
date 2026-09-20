import { AppNav } from "./AppNav";
import { BottomTabs } from "./BottomTabs";

/**
 * Frame for every customer page (events, tickets, login). The landing keeps
 * its own hero and does not use this; comercio has its own shell.
 */
export function AppShell({
  children,
  width = "default",
  bottomTabs = true,
}: {
  children: React.ReactNode;
  width?: "default" | "narrow" | "wide";
  /** Off on flows with their own sticky action bar. */
  bottomTabs?: boolean;
}) {
  const max =
    width === "narrow" ? "max-w-2xl" : width === "wide" ? "max-w-[1120px]" : "max-w-[1120px]";
  return (
    <div className="app-canvas flex min-h-dvh flex-col text-white">
      <AppNav />
      <main className={`mx-auto w-full flex-1 px-4 pb-32 pt-6 sm:px-6 sm:pt-8 lg:px-8 ${max}`}>
        {children}
      </main>
      <BottomTabs hidden={!bottomTabs} />
    </div>
  );
}

export { PageHeader } from "@/components/ui/Header";
