"use client";

import { useCallback, useEffect, useState } from "react";
import { isApiError } from "@/lib/api/client";
import { submitOnboarding } from "@/lib/api/onboarding";
import {
  emptyDraft,
  toSubmission,
  validateStep,
  type OnboardingDraft,
  type OnboardingErrors,
  type OnboardingStep,
} from "@/lib/onboarding/validate";

export const ONBOARDING_STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "company", label: "Empresa" },
  { id: "billing", label: "Pagos" },
  { id: "event", label: "Tu evento" },
  { id: "review", label: "Revisión" },
];

type Outcome = "editing" | "sent" | "used";

function storageKey(token: string) {
  return `allons:onboarding:${token}`;
}

function readStored(token: string): { draft: OnboardingDraft; step: number } | null {
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      draft?: Omit<OnboardingDraft, "billing">;
      step?: number;
    };
    if (!parsed.draft?.company || !parsed.draft.event) return null;
    // Se completa con los campos vacíos: un borrador de antes de un cambio
    // del formulario no trae los campos nuevos.
    const empty = emptyDraft(null);
    return {
      draft: {
        company: { ...empty.company, ...parsed.draft.company },
        event: { ...empty.event, ...parsed.draft.event },
        billing: empty.billing,
      },
      step: Math.min(Math.max(parsed.step ?? 0, 0), 3),
    };
  } catch {
    return null;
  }
}

/**
 * Estado del registro de comercio: el borrador, en qué paso va y qué falta.
 * El borrador vive en localStorage por enlace, así un refresh o un cierre de
 * pestaña no hace perder lo escrito. Los datos de pago no se guardan: en un
 * equipo compartido quedarían a la vista de quien lo use.
 */
export function useOnboardingForm(token: string, invitedEmail: string | null) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => emptyDraft(invitedEmail));
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("editing");
  const [hydrated, setHydrated] = useState(false);

  // Se lee después de montar: en el servidor no hay localStorage, y leerlo
  // en el primer render rompería la hidratación.
  useEffect(() => {
    const stored = readStored(token);
    if (stored) {
      setDraft(stored.draft);
      setStepIndex(stored.step);
    }
    setHydrated(true);
  }, [token]);

  useEffect(() => {
    if (!hydrated || outcome !== "editing") return;
    try {
      window.localStorage.setItem(
        storageKey(token),
        JSON.stringify({
          draft: { company: draft.company, event: draft.event },
          step: stepIndex,
        }),
      );
    } catch {
      // Modo privado o almacenamiento lleno: el formulario sigue igual.
    }
  }, [draft, stepIndex, token, hydrated, outcome]);

  const step = ONBOARDING_STEPS[stepIndex].id;
  const isUploading = Object.values(uploading).some(Boolean);

  const update = useCallback(
    <S extends keyof OnboardingDraft>(section: S, patch: Partial<OnboardingDraft[S]>) => {
      setDraft((current) => ({ ...current, [section]: { ...current[section], ...patch } }));
      // Al corregir un campo, su error se va de una vez.
      setErrors((current) => {
        const keys = Object.keys(patch).map((field) => `${section}.${field}`);
        if (!keys.some((key) => key in current)) return current;
        const next = { ...current };
        for (const key of keys) delete next[key];
        return next;
      });
    },
    [],
  );

  const setFieldUploading = useCallback((key: string, busy: boolean) => {
    setUploading((current) => ({ ...current, [key]: busy }));
  }, []);

  function goTo(index: number) {
    setDirection(index > stepIndex ? 1 : -1);
    setStepIndex(index);
    setSubmitError(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** `false` cuando faltan datos: quien llama lleva el foco al primer error. */
  function next(): boolean {
    const stepErrors = validateStep(step, draft);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return false;
    goTo(Math.min(stepIndex + 1, ONBOARDING_STEPS.length - 1));
    return true;
  }

  function back() {
    if (stepIndex > 0) goTo(stepIndex - 1);
  }

  function edit(target: OnboardingStep) {
    goTo(ONBOARDING_STEPS.findIndex((item) => item.id === target));
  }

  async function submit() {
    const allErrors = validateStep("review", draft);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const first = Object.keys(allErrors)[0].split(".")[0] as OnboardingStep;
      edit(first);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitOnboarding(token, toSubmission(draft));
      clearStored(token);
      setOutcome("sent");
    } catch (error) {
      if (isApiError(error) && error.status === 410) {
        clearStored(token);
        setOutcome("used");
      } else {
        setSubmitError(
          isApiError(error) ? error.message : "No se pudo enviar. Intenta de nuevo.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return {
    draft,
    step,
    stepIndex,
    direction,
    errors,
    isUploading,
    submitting,
    submitError,
    outcome,
    hydrated,
    update,
    setFieldUploading,
    next,
    back,
    edit,
    submit,
  };
}

function clearStored(token: string) {
  try {
    window.localStorage.removeItem(storageKey(token));
  } catch {
    // Nada que limpiar si el almacenamiento no está disponible.
  }
}

export type OnboardingForm = ReturnType<typeof useOnboardingForm>;
