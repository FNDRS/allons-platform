import type { Metadata } from "next";
import { ComercioShell } from "@/components/comercio/ComercioShell";
import { ProviderGate } from "@/components/comercio/ProviderGate";

/** The panel is private: sales, buyers and staff. Never in search results. */
export const metadata: Metadata = {
  title: "Panel del comercio",
  robots: { index: false, follow: false },
};

/**
 * One frame for every comercio page. Living in the layout, the sidebar,
 * header, tabs and the realtime channel survive a tab change: only the
 * page body below re-renders, so moving between Dashboard, Finanzas and
 * Personal does not rebuild the shell or reconnect the socket.
 */
export default function ComercioLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderGate>
      <ComercioShell>{children}</ComercioShell>
    </ProviderGate>
  );
}
