"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  assignProviderResource,
  getProviderResourceGroups,
  providerKeys,
  releaseProviderResource,
  syncProviderResourceGroups,
  type ResourceGroupInput,
} from "@/lib/api/provider";

/** The comercio's unit map and the three writes on it. */
export function useProviderResources(eventId: string, enabled: boolean) {
  const client = useQueryClient();
  const key = providerKeys.resources(eventId);
  const query = useQuery({
    queryKey: key,
    queryFn: () => getProviderResourceGroups(eventId),
    enabled: enabled && Boolean(eventId),
    refetchInterval: 15_000,
  });

  const onError = (error: unknown) => {
    toast.error(isApiError(error) ? error.message : "No se pudo guardar.");
  };
  const onSuccess = (data: Awaited<ReturnType<typeof getProviderResourceGroups>>) => {
    client.setQueryData(key, data);
  };

  const sync = useMutation({
    mutationFn: (groups: ResourceGroupInput[]) => syncProviderResourceGroups(eventId, groups),
    onSuccess: (data) => {
      onSuccess(data);
      toast.success("Recursos guardados");
    },
    onError,
  });
  const assign = useMutation({
    mutationFn: (input: { resourceId: string; ticketId: string }) =>
      assignProviderResource(eventId, input.resourceId, input.ticketId),
    onSuccess: (data) => {
      onSuccess(data);
      toast.success("Asignado");
    },
    onError,
  });
  const release = useMutation({
    mutationFn: (resourceId: string) => releaseProviderResource(eventId, resourceId),
    onSuccess: (data) => {
      onSuccess(data);
      toast.success("Unidad liberada");
    },
    onError,
  });

  return { groups: query.data?.groups ?? [], ...query, sync, assign, release };
}
