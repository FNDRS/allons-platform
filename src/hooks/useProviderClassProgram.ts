"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { classProgramErrorMessage } from "@/hooks/useProviderClassPrograms";
import {
  deleteProviderClassProgram,
  getProviderClassProgram,
  providerClassProgramKeys,
  updateProviderClassProgram,
  type ClassProgramStatus,
} from "@/lib/api/providerClassPrograms";

const STATUS_DONE: Record<ClassProgramStatus, string> = {
  draft: "reactivado",
  pending_review: "enviado a revisión",
  rejected: "rechazado",
  published: "publicado",
  archived: "archivado",
};

/** One class program of the comercio, plus the status and delete actions. */
export function useProviderClassProgram(id: string) {
  const { ready } = useProviderAccess();
  const client = useQueryClient();
  const router = useRouter();
  const query = useQuery({
    queryKey: providerClassProgramKeys.detail(id),
    queryFn: () => getProviderClassProgram(id),
    enabled: ready && Boolean(id),
  });
  const invalidate = () =>
    client.invalidateQueries({ queryKey: providerClassProgramKeys.all });

  const changeStatus = useMutation({
    mutationFn: (status: ClassProgramStatus) => updateProviderClassProgram(id, { status }),
    onSuccess: (saved, status) => {
      toast.success(`"${saved.title}" fue ${STATUS_DONE[status]}`);
      return invalidate();
    },
    onError: (error) => toast.error(classProgramErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () => deleteProviderClassProgram(id),
    onSuccess: () => {
      toast.success("Programa eliminado");
      client.removeQueries({ queryKey: providerClassProgramKeys.detail(id) });
      void invalidate();
      router.replace("/comercio/clases");
    },
    onError: (error) => toast.error(classProgramErrorMessage(error)),
  });

  return {
    program: query.data ?? null,
    isLoading: !ready || query.isLoading,
    error: query.error ? classProgramErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
    changeStatus: (status: ClassProgramStatus) => changeStatus.mutate(status),
    remove: () => remove.mutate(),
    busy: changeStatus.isPending || remove.isPending,
  };
}
