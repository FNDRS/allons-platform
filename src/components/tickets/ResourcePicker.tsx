"use client";

import { useTicketResources } from "@/hooks/useTicketResources";
import type { TicketResourceGroup } from "@/lib/api/tickets";
import { Modal } from "@/components/ui/Modal";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ResourceGrid } from "./ResourceGrid";

/**
 * Sheet where the attendee picks (or changes) their unit. Refreshes every
 * few seconds while open so a unit someone else just took greys out.
 */
export function ResourcePicker({
  ticketId,
  groupId,
  open,
  onClose,
}: {
  ticketId: string;
  groupId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { groups, isLoading, error, refetch, assign } = useTicketResources(
    ticketId,
    open,
  );
  const group: TicketResourceGroup | undefined =
    groups.find((item) => item.id === groupId) ?? groups[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={group ? `Elige tu ${group.name.toLowerCase()}` : "Elige tu lugar"}
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : error || !group ? (
        <ErrorState message={(error as Error | null)?.message} onRetry={() => void refetch()} />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-white/60">
            {group.description ??
              "Toca una unidad libre para reservarla. Puedes cambiarla mientras haya lugar."}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <Legend className="border-white/[0.14] bg-white/[0.08]">Libre</Legend>
            <Legend className="border-accent bg-accent">Tuya</Legend>
            <Legend className="border-white/[0.06] bg-white/[0.03]">Ocupada</Legend>
          </div>
          <div className={assign.isPending ? "pointer-events-none opacity-60" : ""}>
            <ResourceGrid
              columns={group.columns}
              tiles={group.resources.map((unit) => ({
                id: unit.id,
                label: unit.label,
                taken: unit.taken && !unit.mine,
                mine: unit.mine,
              }))}
              onSelect={(tile) => {
                if (tile.taken || tile.mine) return;
                assign.mutate(tile.id, { onSuccess: onClose });
              }}
            />
          </div>
          <p className="text-center text-xs text-white/40">
            {group.available} de {group.total} libres
          </p>
        </div>
      )}
    </Modal>
  );
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-3 rounded-full border ${className}`} aria-hidden />
      {children}
    </span>
  );
}
