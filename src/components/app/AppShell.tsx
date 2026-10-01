import { AppNav } from "./AppNav";
import { BottomTabs } from "./BottomTabs";
import { LegalLinks } from "./LegalLinks";
import { PageTransition } from "./PageTransition";
import { SpaceAtmosphere } from "./SpaceAtmosphere";
import { StairsCoverProvider } from "./StairsCover";

/**
 * Frame for every customer page (events, tickets, login). The landing keeps
 * its own hero and does not use this; comercio has its own shell.
 */
export function AppShell({
  children,
  width = "default",
  bottomTabs = true,
  tone = "default",
  cover = false,
  fit = false,
}: {
  children: React.ReactNode;
  width?: "default" | "narrow" | "listing" | "detail";
  /** Off on flows with their own sticky action bar. */
  bottomTabs?: boolean;
  /** `space` is the eventos listing. `brand` is unused orange canvas. */
  tone?: "default" | "brand" | "space";
  /** White stairs over the whole shell, including the nav. */
  cover?: boolean;
  /** Single-screen page with no tabs: drops the tab clearance so it fits without scrolling. */
  fit?: boolean;
}) {
  const frame = (
    <ShellFrame width={width} bottomTabs={bottomTabs} tone={tone} fit={fit}>
      {children}
    </ShellFrame>
  );
  return cover ? <StairsCoverProvider>{frame}</StairsCoverProvider> : frame;
}

function ShellFrame({
  children,
  width,
  bottomTabs,
  tone,
  fit,
}: {
  children: React.ReactNode;
  width: "default" | "narrow" | "listing" | "detail";
  bottomTabs: boolean;
  tone: "default" | "brand" | "space";
  fit: boolean;
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
        tone === "brand" ? "events-brand" : tone === "space" ? "space" : ""
      }`}
    >
      {tone === "space" ? <SpaceAtmosphere /> : null}
      <AppNav />
      <main
        id="contenido"
        tabIndex={-1}
        className={`relative z-10 mx-auto w-full min-w-0 flex-1 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 ${
          fit ? "pb-6" : "pb-28 sm:pb-32"
        } ${max}`}
      >
        <PageTransition>{children}</PageTransition>
        <LegalLinks className={`${fit ? "mt-8" : "mt-16"} border-t border-border pt-6`} />
      </main>
      <BottomTabs hidden={!bottomTabs} />
    </div>
  );
}

export { PageHeader } from "@/components/ui/Header";
