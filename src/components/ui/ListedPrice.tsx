import { formatPriceCents } from "@/lib/format";

/** Ticket price, or a placeholder while the buyer-facing quote is loading. */
export function ListedPrice({ cents }: { cents: number | null }) {
  if (cents == null) {
    return (
      <span
        aria-hidden
        className="inline-block h-[1.15em] w-16 shimmer rounded-md align-middle"
      />
    );
  }
  return <>{formatPriceCents(cents)}</>;
}
