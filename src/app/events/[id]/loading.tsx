import { AppShell } from "@/components/app/AppShell";
import { EventDetailSkeleton } from "@/components/events/EventDetailSkeleton";

/**
 * Lets the router prefetch this dynamic route up to here, so tapping a card
 * paints the page shell at once instead of waiting for the server.
 */
export default function EventLoading() {
  return (
    <AppShell width="detail" bottomTabs={false}>
      <EventDetailSkeleton />
    </AppShell>
  );
}
