"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  listCollaborations,
  providerKeys,
  respondCollaboration,
} from "@/lib/api/provider";

/**
 * Invites to co-host other comercios' events, and the answer to them.
 * Accepting adds the event to this comercio's list and dashboard, so both
 * are refreshed along with the inbox.
 */
export function useCollaborations(enabled: boolean) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: providerKeys.collaborations,
    queryFn: listCollaborations,
    enabled,
    // No realtime signal covers this table; a fresh invite shows up on the
    // next poll.
    refetchInterval: 60_000,
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: providerKeys.collaborations });
    void client.invalidateQueries({ queryKey: providerKeys.events });
    void client.invalidateQueries({ queryKey: providerKeys.dashboard });
    void client.invalidateQueries({ queryKey: providerKeys.activity });
  };
  const respond = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      respondCollaboration(id, accept),
    onSuccess: (_result, { accept }) => {
      toast.success(accept ? "Ahora colaboras en este evento" : "Invitación rechazada");
      refresh();
    },
    onError: (error: unknown) =>
      toast.error(isApiError(error) ? error.message : "No se pudo responder."),
  });

  return {
    pending: query.data?.pending ?? [],
    accepted: query.data?.accepted ?? [],
    ...query,
    respond,
  };
}
