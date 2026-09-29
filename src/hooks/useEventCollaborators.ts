"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  getEventCollaborators,
  inviteEventCollaborator,
  providerKeys,
  revokeEventCollaborator,
} from "@/lib/api/provider";

/** Who shares one event, plus the host's invite and remove actions. */
export function useEventCollaborators(eventId: string, enabled: boolean) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: providerKeys.collaborators(eventId),
    queryFn: () => getEventCollaborators(eventId),
    enabled,
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: providerKeys.collaborators(eventId) });
    void client.invalidateQueries({ queryKey: providerKeys.events });
  };
  const onError = (error: unknown) =>
    toast.error(isApiError(error) ? error.message : "No se pudo completar.");

  const invite = useMutation({
    mutationFn: (handle: string) => inviteEventCollaborator(eventId, handle),
    onSuccess: (result) => {
      toast.success(
        result.emailed > 0
          ? `Invitación enviada a ${result.collaborator.provider.name}`
          : `${result.collaborator.provider.name} quedó invitado`,
      );
      refresh();
    },
    onError,
  });
  const revoke = useMutation({
    mutationFn: (providerId: string) => revokeEventCollaborator(eventId, providerId),
    onSuccess: () => {
      toast.success("Comercio quitado del evento");
      refresh();
    },
    onError,
  });

  return { ...query, invite, revoke };
}
