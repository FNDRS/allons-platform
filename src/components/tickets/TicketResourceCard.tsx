import type { TicketResourceSummary } from "@/lib/api/tickets";

/** The unit chosen at checkout. It stays on the pass and cannot be moved. */
export function TicketResourceCard({ group }: { group: TicketResourceSummary }) {
  if (!group.assigned) return null;
  const name = group.name.toLowerCase();
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">
        Tu {name}
      </p>
      <p className="text-[28px] font-bold leading-none tracking-[-0.04em] text-white sm:text-[34px]">
        {group.assigned.label}
      </p>
    </div>
  );
}
