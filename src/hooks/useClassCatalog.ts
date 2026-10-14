"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { classProgramErrorMessage } from "@/hooks/useProviderClassPrograms";
import {
  classCatalogKeys,
  createCatalogPackage,
  deactivateCatalogPackage,
  listClassCatalog,
  updateCatalogPackage,
  type CatalogPackage,
  type CatalogPackageInput,
} from "@/lib/api/classCatalog";

/** True when the package sells classes of that program (or of every program). */
export function catalogCoversProgram(item: CatalogPackage, programId: string | null): boolean {
  if (!item.active) return false;
  return item.programIds.length === 0 || (programId !== null && item.programIds.includes(programId));
}

/** Comercio-wide packages and memberships, active ones first. */
export function useClassCatalog() {
  const { ready } = useProviderAccess();
  const query = useQuery({
    queryKey: classCatalogKeys.all,
    queryFn: listClassCatalog,
    enabled: ready,
  });
  const items: CatalogPackage[] = [...(query.data ?? [])].sort(
    (a, b) => Number(b.active) - Number(a.active) || a.sortOrder - b.sortOrder,
  );
  return {
    items,
    isLoading: !ready || query.isLoading,
    error: query.error ? classProgramErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
  };
}

type SaveInput = { id: string | null; body: CatalogPackageInput };

/** Create, edit, deactivate and reactivate catalog items. */
export function useClassCatalogActions() {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: classCatalogKeys.all });

  const save = useMutation({
    mutationFn: ({ id, body }: SaveInput) =>
      id ? updateCatalogPackage(id, body) : createCatalogPackage(body),
    onSuccess: (_, { id, body }) => {
      toast.success(id ? `Guardamos los cambios de ${body.name}.` : `${body.name} ya está a la venta.`);
      return invalidate();
    },
    onError: (error) => toast.error(classProgramErrorMessage(error)),
  });

  const setActive = useMutation({
    mutationFn: async ({ item, active }: { item: CatalogPackage; active: boolean }) => {
      if (active) await updateCatalogPackage(item.id, { active: true });
      else await deactivateCatalogPackage(item.id);
    },
    onSuccess: (_, { item, active }) => {
      toast.success(active ? `${item.name} está a la venta de nuevo.` : `${item.name} dejó de venderse.`);
      return invalidate();
    },
    onError: (error) => toast.error(classProgramErrorMessage(error)),
  });

  return {
    /** Resolves to whether it saved, so the editor knows when to close. */
    save: (input: SaveInput) =>
      save.mutateAsync(input).then(
        () => true,
        () => false,
      ),
    saving: save.isPending,
    setActive: (item: CatalogPackage, active: boolean) => setActive.mutate({ item, active }),
    togglingId: setActive.isPending ? setActive.variables?.item.id ?? null : null,
  };
}
