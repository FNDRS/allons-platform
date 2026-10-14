"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useClassCatalog, useClassCatalogActions } from "@/hooks/useClassCatalog";
import { useProviderClassPrograms } from "@/hooks/useProviderClassPrograms";
import type { CatalogPackage } from "@/lib/api/classCatalog";
import { ClassCatalogCard } from "./ClassCatalogCard";
import { ClassCatalogEditorModal } from "./ClassCatalogEditorModal";

type Editing = { item: CatalogPackage | null } | null;

/** Packages and memberships sold across the comercio's programs. */
export function ClassCatalogView() {
  const { items, isLoading, error, refetch } = useClassCatalog();
  const { programs } = useProviderClassPrograms();
  const actions = useClassCatalogActions();
  const [editing, setEditing] = useState<Editing>(null);
  const activeCount = items.filter((item) => item.active).length;

  const newButton = (
    <Button size="sm" onClick={() => setEditing({ item: null })}>
      <Plus className="size-4" aria-hidden />
      Crear paquete
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-white/50">
          {isLoading || error ? " " : `${activeCount} a la venta`}
        </p>
        {newButton}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[240px] w-full rounded-[24px]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Aún no vendes paquetes generales"
          body="Crea paquetes o membresías que sirvan para varios programas a la vez."
          action={newButton}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ClassCatalogCard
              key={item.id}
              item={item}
              toggling={actions.togglingId === item.id}
              onEdit={() => setEditing({ item })}
              onToggleActive={() => actions.setActive(item, !item.active)}
            />
          ))}
        </div>
      )}

      {editing ? (
        <ClassCatalogEditorModal
          item={editing.item}
          programs={programs}
          saving={actions.saving}
          onClose={() => setEditing(null)}
          onSave={async (body) => {
            const saved = await actions.save({ id: editing.item?.id ?? null, body });
            if (saved) setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}
