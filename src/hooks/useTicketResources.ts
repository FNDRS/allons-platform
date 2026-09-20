"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  assignTicketResource,
  getTicketResources,
  ticketKeys,
} from "@/lib/api/tickets";

/** The unit map for one ticket plus the pick mutation. */
export function useTicketResources(ticketId: string, enabled: boolean) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ticketKeys.resources(ticketId),
    queryFn: () => getTicketResources(ticketId),
    enabled: enabled && Boolean(ticketId),
    refetchInterval: enabled ? 10_000 : false,
  });

  const assign = useMutation({
    mutationFn: (resourceId: string) => assignTicketResource(ticketId, resourceId),
    onSuccess: (data) => {
      client.setQueryData(ticketKeys.resources(ticketId), data);
      void client.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      void client.invalidateQueries({ queryKey: ticketKeys.list });
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "resource_taken") {
        toast.error("Alguien acaba de tomar esa unidad. Elige otra.");
      } else {
        toast.error(isApiError(error) ? error.message : "No pudimos guardar tu elección.");
      }
      void query.refetch();
    },
  });

  return { groups: query.data?.groups ?? [], ...query, assign };
}
