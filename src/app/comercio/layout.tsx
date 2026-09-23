import { ComercioShell } from "@/components/comercio/ComercioShell";
import { ProviderGate } from "@/components/comercio/ProviderGate";

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
