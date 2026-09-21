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
  tone = "default",
}: {
  children: React.ReactNode;
  width?: "default" | "narrow" | "listing" | "detail";
  /** Off on flows with their own sticky action bar. */
  bottomTabs?: boolean;
  /** Brand fill, used on the public events listing so the cards sit on orange. */
  tone?: "default" | "brand";
}) {
  const max =
    width === "narrow"
      ? "max-w-2xl"
      : width === "listing"
        ? "max-w-[1040px]"
        : width === "detail"
          ? "max-w-[720px]"
          : "max-w-[1120px]";
  return (
    <div
      className={`app-canvas flex min-h-dvh flex-col text-white ${
        tone === "brand" ? "events-brand" : ""
      }`}
    >
      <AppNav />
      <main className={`mx-auto w-full flex-1 px-4 pb-32 pt-6 sm:px-6 sm:pt-8 lg:px-8 ${max}`}>
        {children}
      </main>
      <BottomTabs hidden={!bottomTabs} />
    </div>
  );
}

export { PageHeader } from "@/components/ui/Header";
