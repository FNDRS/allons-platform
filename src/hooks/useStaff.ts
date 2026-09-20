"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  inviteStaff,
  listStaff,
  providerKeys,
  removeStaff,
  type StaffRole,
} from "@/lib/api/provider";

const INVITE_REDIRECT = "https://allonsapp.com/verify";

export function useStaff(enabled: boolean) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: providerKeys.staff, queryFn: listStaff, enabled });
  const refresh = () => void client.invalidateQueries({ queryKey: providerKeys.staff });
  const onError = (error: unknown) =>
    toast.error(isApiError(error) ? error.message : "No se pudo completar.");

  const invite = useMutation({
    mutationFn: (input: { email: string; name: string; role: StaffRole }) =>
      inviteStaff({ ...input, redirectTo: INVITE_REDIRECT }),
    onSuccess: () => {
      toast.success("Invitación enviada");
      refresh();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: (userId: string) => removeStaff(userId),
    onSuccess: () => {
      toast.success("Acceso desactivado");
      refresh();
    },
    onError,
  });

  return { members: query.data ?? [], ...query, invite, remove };
}
