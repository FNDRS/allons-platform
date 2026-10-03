"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  campaignKeys,
  createHubCampaign,
  getHubCampaign,
  updateHubCampaign,
  type CampaignInput,
  type CampaignQuestion,
  type CampaignStatus,
} from "@/lib/api/campaigns";
import type { EventQuestionKind } from "@/lib/api/events";

export const QUESTION_KINDS: { value: EventQuestionKind; label: string }[] = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Párrafo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "select", label: "Lista" },
  { value: "radio", label: "Opción única" },
  { value: "checkbox", label: "Casillas" },
  { value: "boolean", label: "Sí / No" },
];

export const needsOptions = (kind: string) =>
  kind === "select" || kind === "radio" || kind === "checkbox";

export interface QuestionDraft {
  key: string;
  id?: string;
  label: string;
  kind: EventQuestionKind;
  /** Comma separated, same as the event form. */
  optionsText: string;
  requiredForComercio: boolean;
  requiredForAttendee: boolean;
}

let seq = 0;
const newKey = () => `q-${Date.now()}-${seq++}`;

const toDraft = (q: CampaignQuestion): QuestionDraft => ({
  key: q.id,
  id: q.id,
  label: q.label,
  kind: q.kind,
  optionsText: (q.options ?? []).join(", "),
  requiredForComercio: q.requiredForComercio,
  requiredForAttendee: q.requiredForAttendee,
});

const parseOptions = (text: string) => [
  ...new Set(text.split(",").map((o) => o.trim()).filter(Boolean)),
];

/** `YYYY-MM-DD` of a date in local time. */
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Create or edit a campaign: fields, questions, validation and save. */
export function useCampaignEditor(id?: string) {
  const client = useQueryClient();
  const router = useRouter();
  const existing = useQuery({
    queryKey: [...campaignKeys.hub(id ?? ""), "config"],
    queryFn: () => getHubCampaign(id as string),
    enabled: Boolean(id),
  });

  const today = new Date();
  const inAMonth = new Date(today.getTime() + 30 * 86_400_000);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDay, setStartDay] = useState(dayKey(today));
  const [endDay, setEndDay] = useState(dayKey(inAMonth));
  const [status, setStatus] = useState<CampaignStatus>("draft");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  // Follows fresh copies of the campaign until the first edit, then never
  // overwrites what the hub typed.
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const data = existing.data;
    if (!data || dirty) return;
    setName(data.name);
    setDescription(data.description ?? "");
    setStartDay(dayKey(new Date(data.startsAt)));
    setEndDay(dayKey(new Date(data.endsAt)));
    setStatus(data.status);
    setQuestions(data.questions.map(toDraft));
  }, [existing.data, dirty]);

  const edit =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      setDirty(true);
      set(v);
    };

  const error = useMemo(() => {
    if (name.trim().length < 3) return "Ponle un nombre de al menos 3 letras.";
    if (endDay < startDay) return "La fecha de cierre no puede ser antes de la de inicio.";
    if (questions.some((q) => !q.label.trim())) return "Escribe el texto de cada pregunta.";
    if (questions.some((q) => needsOptions(q.kind) && parseOptions(q.optionsText).length === 0)) {
      return "Las preguntas con opciones necesitan al menos una.";
    }
    return null;
  }, [name, startDay, endDay, questions]);

  const save = useMutation({
    mutationFn: () => {
      const body: CampaignInput = {
        name: name.trim(),
        description: description.trim(),
        // Whole days in Honduras time.
        startsAt: new Date(`${startDay}T00:00:00-06:00`).toISOString(),
        endsAt: new Date(`${endDay}T23:59:59-06:00`).toISOString(),
        status,
        questions: questions.map((q, i) => ({
          ...(q.id ? { id: q.id } : {}),
          label: q.label.trim(),
          kind: q.kind,
          ...(needsOptions(q.kind) ? { options: parseOptions(q.optionsText) } : {}),
          requiredForComercio: q.requiredForComercio,
          requiredForAttendee: q.requiredForAttendee,
          sortOrder: i,
        })),
      };
      return id ? updateHubCampaign(id, body) : createHubCampaign(body);
    },
    onSuccess: (saved) => {
      void client.invalidateQueries({ queryKey: campaignKeys.hubList, exact: true });
      void client.invalidateQueries({ queryKey: campaignKeys.hub(saved.id) });
      toast.success(id ? "Campaña guardada" : "Campaña creada");
      router.replace(`/comercio/campanas/${encodeURIComponent(saved.id)}`);
    },
    onError: (e: unknown) =>
      toast.error(isApiError(e) ? e.message : "No se pudo guardar la campaña."),
  });

  return {
    editing: Boolean(id),
    loading: Boolean(id) && existing.isLoading,
    loadError: existing.data ? null : (existing.error as Error | null),
    reload: () => void existing.refetch(),
    name,
    setName: edit(setName),
    description,
    setDescription: edit(setDescription),
    startDay,
    setStartDay: edit(setStartDay),
    endDay,
    setEndDay: edit(setEndDay),
    status,
    setStatus: edit(setStatus),
    questions,
    addQuestion: () => {
      setDirty(true);
      setQuestions((prev) => [
        ...prev,
        {
          key: newKey(),
          label: "",
          kind: "text",
          optionsText: "",
          requiredForComercio: true,
          requiredForAttendee: false,
        },
      ]);
    },
    updateQuestion: (key: string, patch: Partial<QuestionDraft>) => {
      setDirty(true);
      setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
    },
    removeQuestion: (key: string) => {
      setDirty(true);
      setQuestions((prev) => prev.filter((q) => q.key !== key));
    },
    error,
    submit: () => {
      if (error) {
        toast.error(error);
        return;
      }
      save.mutate();
    },
    saving: save.isPending,
  };
}
