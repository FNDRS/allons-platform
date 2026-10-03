"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  answerHubCampaignRequest,
  campaignKeys,
  deleteHubCampaign,
  downloadHubCampaignReport,
  getHubCampaign,
  getHubCampaignReport,
  inviteToHubCampaign,
  listHubCampaignEvents,
  listHubCampaignMembers,
  removeHubCampaignEvent,
  removeHubCampaignMember,
} from "@/lib/api/campaigns";

const errorText = (error: unknown, fallback: string) =>
  isApiError(error) ? error.message : fallback;

/**
 * One campaign from its hub's side: config, members, events and the
 * attendance report, plus every action the hub takes on them.
 */
export function useHubCampaignPanel(id: string) {
  const client = useQueryClient();
  const router = useRouter();
  const key = campaignKeys.hub(id);

  const campaign = useQuery({ queryKey: [...key, "config"], queryFn: () => getHubCampaign(id) });
  const members = useQuery({ queryKey: [...key, "members"], queryFn: () => listHubCampaignMembers(id) });
  const events = useQuery({ queryKey: [...key, "events"], queryFn: () => listHubCampaignEvents(id) });
  const report = useQuery({ queryKey: [...key, "report"], queryFn: () => getHubCampaignReport(id) });

  const refresh = () => {
    void client.invalidateQueries({ queryKey: key });
    void client.invalidateQueries({ queryKey: campaignKeys.hubList, exact: true });
  };
  const onError = (fallback: string) => (error: unknown) =>
    toast.error(errorText(error, fallback));

  const invite = useMutation({
    mutationFn: (handle: string) => inviteToHubCampaign(id, handle),
    onSuccess: () => {
      toast.success("Invitación enviada");
      refresh();
    },
    onError: onError("No se pudo invitar."),
  });
  const answer = useMutation({
    mutationFn: ({ memberId, approve }: { memberId: string; approve: boolean }) =>
      answerHubCampaignRequest(id, memberId, approve),
    onSuccess: refresh,
    onError: onError("No se pudo responder."),
  });
  const removeMember = useMutation({
    mutationFn: (memberId: string) => removeHubCampaignMember(id, memberId),
    onSuccess: refresh,
    onError: onError("No se pudo quitar al comercio."),
  });
  const removeEvent = useMutation({
    mutationFn: (eventId: string) => removeHubCampaignEvent(id, eventId),
    onSuccess: refresh,
    onError: onError("No se pudo quitar el evento."),
  });
  const remove = useMutation({
    mutationFn: () => deleteHubCampaign(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: campaignKeys.hubList, exact: true });
      toast.success("Campaña eliminada");
      router.replace("/comercio/campanas");
    },
    onError: onError("No se pudo eliminar."),
  });
  const exportReport = useMutation({
    mutationFn: (format: "pdf" | "csv") =>
      downloadHubCampaignReport(id, format, `campana-${campaign.data?.slug ?? id}`),
    onError: onError("No se pudo exportar."),
  });

  return {
    campaign,
    members,
    events,
    report,
    invite,
    answer,
    removeMember,
    removeEvent,
    remove,
    exportReport,
  };
}
