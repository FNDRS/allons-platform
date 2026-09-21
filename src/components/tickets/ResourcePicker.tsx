"use client";

import { useTicketResources } from "@/hooks/useTicketResources";
import type { TicketResourceGroup } from "@/lib/api/tickets";
import { Modal } from "@/components/ui/Modal";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { ResourceGrid, studioFrontLabel } from "./ResourceGrid";

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
  const { groups, isLoading, error, refetch, assign } = useTicketResources(ticketId, open);
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
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted">
            {group.description ??
              "Toca una unidad libre para reservarla. Puedes cambiarla mientras haya lugar."}
          </p>
          <div className={assign.isPending ? "pointer-events-none opacity-60" : ""}>
            <ResourceGrid
              columns={group.columns}
              frontLabel={studioFrontLabel(group.name)}
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
          <div className="flex items-center justify-between text-[12px] text-muted">
            <div className="flex items-center gap-4">
              <Legend className="border-border bg-white/[0.09]">Libre</Legend>
              <Legend className="border-accent bg-accent">Tuya</Legend>
              <Legend className="border-transparent bg-white/[0.03]">Ocupada</Legend>
            </div>
            <span className="tabular-nums">
              {group.available} de {group.total} libres
            </span>
          </div>
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
