"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  addEventToCampaign,
  answerCampaignInvite,
  campaignKeys,
  getComercioCampaign,
  leaveCampaign,
  removeEventFromCampaign,
  requestToJoinCampaign,
  updateCampaignSharing,
  type ComercioCampaign,
} from "@/lib/api/campaigns";

export type JoinStage =
  | "can-request"
  | "requested"
  | "invited"
  | "invite-closed"
  | "member"
  | "closed";

function stageOf(c: ComercioCampaign): JoinStage {
  const m = c.membership;
  const notOver = new Date(c.endsAt) > new Date();
  if (m?.status === "accepted") return "member";
  if (m?.status === "pending" && m.initiatedBy === "hub") {
    // Same rule as the API: a draft still takes members, archived or over not.
    return c.status !== "archived" && notOver ? "invited" : "invite-closed";
  }
  if (m?.status === "pending") return "requested";
  return c.status === "published" && notOver ? "can-request" : "closed";
}

/** One campaign from a comercio's side: sharing, joining, its events. */
export function useComercioCampaignPanel(id: string) {
  const client = useQueryClient();
  const key = campaignKeys.comercio(id);
  const query = useQuery({ queryKey: key, queryFn: () => getComercioCampaign(id) });
  const campaign = query.data;

  // Optional questions picked on screen; follows the saved set until the
  // comercio touches one, so a refetch never undoes its choice.
  const [picked, setPicked] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!campaign || dirty) return;
    setPicked(campaign.membership?.optionalQuestionIds ?? []);
  }, [campaign, dirty]);

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: key });
    void client.invalidateQueries({ queryKey: campaignKeys.comercioList, exact: true });
  };
  // Membership and sharing changes save the draft; event changes leave it.
  const invalidateAndReset = () => {
    invalidate();
    setDirty(false);
  };
  const onError = (fallback: string) => (e: unknown) =>
    toast.error(isApiError(e) ? e.message : fallback);

  const request = useMutation({
    mutationFn: () => requestToJoinCampaign(id, picked),
    onSuccess: () => {
      toast.success("Solicitud enviada");
      invalidateAndReset();
    },
    onError: onError("No se pudo enviar la solicitud."),
  });
  const answer = useMutation({
    mutationFn: (accept: boolean) =>
      answerCampaignInvite(campaign?.membership?.id ?? "", accept, picked),
    onSuccess: invalidateAndReset,
    onError: onError("No se pudo responder."),
  });
  const saveSharing = useMutation({
    mutationFn: () => updateCampaignSharing(id, picked),
    onSuccess: () => {
      toast.success("Preguntas guardadas");
      invalidateAndReset();
    },
    onError: onError("No se pudo guardar."),
  });
  const leave = useMutation({
    mutationFn: () => leaveCampaign(id),
    onSuccess: invalidateAndReset,
    onError: onError("No se pudo salir."),
  });
  const addEvent = useMutation({
    mutationFn: (eventId: string) => addEventToCampaign(id, eventId),
    onSuccess: invalidate,
    onError: onError("No se pudo sumar el evento."),
  });
  const removeEvent = useMutation({
    mutationFn: (eventId: string) => removeEventFromCampaign(id, eventId),
    onSuccess: invalidate,
    onError: onError("No se pudo quitar el evento."),
  });

  const saved = campaign?.membership?.optionalQuestionIds ?? [];
  return {
    query,
    campaign,
    stage: campaign ? stageOf(campaign) : null,
    picked,
    toggleOptional: (qid: string) => {
      setDirty(true);
      setPicked((prev) => (prev.includes(qid) ? prev.filter((x) => x !== qid) : [...prev, qid]));
    },
    sharingChanged: picked.length !== saved.length || picked.some((x) => !saved.includes(x)),
    request,
    answer,
    saveSharing,
    leave,
    addEvent,
    removeEvent,
    busy: request.isPending || answer.isPending || saveSharing.isPending || leave.isPending,
    busyEventId: addEvent.isPending
      ? addEvent.variables
      : removeEvent.isPending
        ? removeEvent.variables
        : undefined,
  };
}
