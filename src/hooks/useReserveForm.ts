"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { displayNameOf, useAuth } from "@/components/app/AuthProvider";
import { deriveReserveState, useEventDetail } from "@/hooks/useEventDetail";
import { isApiError } from "@/lib/api/client";
import {
  GOVERNMENT_ID_REQUIRED_CODE,
  formatGovernmentId,
  isValidGovernmentId,
} from "@/lib/governmentId";
import {
  eventKeys,
  getEventQuote,
  getEventResources,
  resourceGroupsForTicketType,
  isEntryTypeOnSale,
  type EventEntryType,
  type EventQuestion,
} from "@/lib/api/events";
import {
  initiatePayment,
  paymentLinkStorageKey,
  type InitiatePaymentInput,
} from "@/lib/api/payments";
import { reserveFreeTickets, type AnswerInput } from "@/lib/api/tickets";
import { useReserveResourceSelection } from "@/hooks/useReserveResourceSelection";
import { useQuery } from "@tanstack/react-query";

export interface HolderDraft {
  name: string;
  email: string;
  answers: Record<string, string>;
}

const MAX_QUANTITY = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Local countdown length until the order returns a real `expiresAt`. */
const HOLD_COUNTDOWN_MS = 30 * 60 * 1000;

function holdDeadline(): string {
  return new Date(Date.now() + HOLD_COUNTDOWN_MS).toISOString();
}

/** Same tab, including a reload. A fresh 30 minutes on refresh would be a way to stall. */
function holdStorageKey(eventId: string) {
  return `allons-hold:${eventId}`;
}

function readStoredHold(eventId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(holdStorageKey(eventId));
    if (!raw) return null;
    const time = new Date(raw).getTime();
    // An expired deadline is not a state to show. Coming back starts a new one.
    if (!Number.isFinite(time) || time <= Date.now()) {
      clearStoredHold(eventId);
      return null;
    }
    return new Date(time).toISOString();
  } catch {
    return null;
  }
}

function writeStoredHold(eventId: string, iso: string) {
  try {
    window.sessionStorage.setItem(holdStorageKey(eventId), iso);
  } catch {
    /* private mode: the in-memory clock still runs until the tab closes */
  }
}

function clearStoredHold(eventId: string) {
  try {
    window.sessionStorage.removeItem(holdStorageKey(eventId));
  } catch {
    /* nothing to clear */
  }
}

function emptyHolder(): HolderDraft {
  return { name: "", email: "", answers: {} };
}

export function answersToList(
  questions: EventQuestion[],
  answers: Record<string, string>,
): AnswerInput[] {
  return questions
    .map((question) => ({
      questionId: question.id,
      answer: (answers[question.id] ?? "").trim(),
    }))
    .filter((answer) => answer.answer.length > 0);
}

/** Missing required answers for one holder, by question id. */
export function missingAnswers(
  questions: EventQuestion[],
  answers: Record<string, string>,
): string[] {
  return questions
    .filter((question) => question.required)
    .filter((question) => {
      const value = (answers[question.id] ?? "").trim();
      // The app treats a required yes/no as "must be yes" (a consent box).
      if (question.kind === "boolean" || question.kind === "checkbox") {
        return value !== "Sí";
      }
      return value.length === 0;
    })
    .map((question) => question.id);
}

/**
 * All the state behind /events/[id]/reservar. The page only renders.
 */
export function useReserveForm(eventId: string) {
  const router = useRouter();
  const { user } = useAuth();
  const detail = useEventDetail(eventId);
  const event = detail.event;

  const [entryTypeId, setEntryTypeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [holders, setHolders] = useState<HolderDraft[]>([emptyHolder()]);
  const [donation, setDonation] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Identidad de quien paga. Clinpays la exige para abrir su formulario. */
  const [governmentId, setGovernmentIdState] = useState("");
  /** La API la pidió al iniciar: la cotización no lo sabía o cambió la pasarela. */
  const [governmentIdDemanded, setGovernmentIdDemanded] = useState(false);

  const availableTypes = useMemo(() => {
    // Same gate as the detail CTA: a finished or sold-out event sells nothing,
    // whatever a stale tier row says.
    if (!event || deriveReserveState(event).kind === "closed") return [];
    const now = Date.now();
    return (event.entryTypes ?? []).filter(
      (type) => isEntryTypeOnSale(type, now) && !type.soldOut && type.remaining !== 0,
    );
  }, [event]);

  // Pick the only (or first) tier so the buyer has one less tap.
  useEffect(() => {
    if (entryTypeId || availableTypes.length === 0) return;
    setEntryTypeId(availableTypes[0].id);
  }, [availableTypes, entryTypeId]);

  const entryType: EventEntryType | null =
    availableTypes.find((type) => type.id === entryTypeId) ?? null;

  const maxQuantity = Math.min(
    MAX_QUANTITY,
    entryType?.remaining != null ? Math.max(entryType.remaining, 1) : MAX_QUANTITY,
  );

  // Switching to a tier with fewer seats left must pull the quantity down.
  useEffect(() => {
    setQuantity((current) => Math.min(current, maxQuantity));
  }, [maxQuantity]);

  // Ticket #1 is the buyer unless they type otherwise.
  useEffect(() => {
    if (!user) return;
    setHolders((current) => {
      const [first, ...rest] = current;
      if (first.name || first.email) return current;
      return [
        { ...first, name: displayNameOf(user), email: user.email ?? "" },
        ...rest,
      ];
    });
  }, [user]);

  useEffect(() => {
    setHolders((current) => {
      if (current.length === quantity) return current;
      if (current.length > quantity) return current.slice(0, quantity);
      return [
        ...current,
        ...Array.from({ length: quantity - current.length }, emptyHolder),
      ];
    });
  }, [quantity]);

  const questions = useMemo(
    () => [...(event?.questions ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [event],
  );

  const isFree =
    event?.ticketMode === "free" || (entryType ? entryType.priceCents === 0 : false);
  const donationCents = Math.max(0, Math.round((Number(donation) || 0) * 100));
  const donationAllowed = Boolean(entryType?.donationEnabled) && !isFree;
  const ticketsCents = (entryType?.priceCents ?? 0) * quantity;
  const subtotalCents = ticketsCents + (donationAllowed ? donationCents : 0);

  // The clock starts as soon as a paid ticket is selected and is not reset by
  // changing quantity, tier, or a reload while it is still running. It only
  // clears when nothing paid is selected. A deadline that already passed is
  // dropped, so leaving and coming back starts a fresh 30 minutes.
  const [hold, setHold] = useState<{ eventId: string; expiresAt: string } | null>(
    null,
  );
  const hasPaidSelection = Boolean(entryType) && !isFree;
  const selectionKnown =
    !detail.isLoading && !detail.isPlaceholderData && Boolean(event);
  const paidTypesExist = availableTypes.some((type) => type.priceCents > 0);
  useEffect(() => {
    if (!selectionKnown) return;
    // The tier is chosen in another effect. Clearing here, before that lands,
    // would drop the saved deadline and a reload would start 30 minutes again.
    if (!entryTypeId) {
      if (!paidTypesExist) {
        setHold(null);
        clearStoredHold(eventId);
      }
      return;
    }
    if (!hasPaidSelection) {
      setHold(null);
      clearStoredHold(eventId);
      return;
    }
    setHold((current) => {
      if (current?.eventId === eventId) return current;
      const stored = readStoredHold(eventId);
      const expiresAt = stored ?? holdDeadline();
      if (!stored) writeStoredHold(eventId, expiresAt);
      return { eventId, expiresAt };
    });
  }, [selectionKnown, hasPaidSelection, paidTypesExist, entryTypeId, eventId]);
  const holdExpiresAt = hold?.eventId === eventId ? hold.expiresAt : null;

  // The clock ran out on this visit. Leave the form and land on the event.
  useEffect(() => {
    if (!holdExpiresAt) return;
    const remaining = new Date(holdExpiresAt).getTime() - Date.now();
    if (!Number.isFinite(remaining)) return;
    const leave = () => {
      clearStoredHold(eventId);
      router.replace(`/events/${encodeURIComponent(eventId)}`);
    };
    if (remaining <= 0) {
      leave();
      return;
    }
    const timer = window.setTimeout(leave, remaining);
    return () => window.clearTimeout(timer);
  }, [holdExpiresAt, eventId, router]);

  /**
   * El total lo cotiza el servidor, que es quien cobra. Mientras la cotización
   * carga se muestra el subtotal, para no enseñar un total que luego salta.
   */
  const quoteQuery = useQuery({
    queryKey: eventKeys.quote(
      eventId,
      entryType?.id ?? null,
      quantity,
      donationAllowed ? donationCents : 0,
    ),
    queryFn: () =>
      getEventQuote(eventId, {
        entryTypeId: entryType?.id ?? null,
        quantity,
        donationCents: donationAllowed ? donationCents : 0,
      }),
    enabled: Boolean(eventId) && Boolean(entryType) && !isFree,
    staleTime: 60_000,
  });
  const serviceChargeCents = quoteQuery.data?.serviceChargeCents ?? 0;
  const totalCents = quoteQuery.data?.totalCents ?? subtotalCents;
  // Clinpays no abre su formulario sin identidad. La cotización lo avisa de
  // antemano; si fue la API quien lo pidió, el formulario lo recuerda.
  const needsGovernmentId =
    !isFree &&
    (quoteQuery.data?.requiresGovernmentId === true || governmentIdDemanded);
  const governmentIdValid = isValidGovernmentId(governmentId);

  const resourceQuery = useQuery({
    queryKey: eventKeys.resources(eventId, entryType?.id ?? null),
    queryFn: () =>
      getEventResources(eventId, entryType?.id ?? null).then(
        (res) => res.groups,
      ),
    enabled: Boolean(eventId),
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
  // El detalle del evento trae los mapas de todos los horarios: sirve de
  // respaldo mientras carga el mapa en vivo, filtrado con la misma regla.
  const resourceGroups =
    resourceQuery.data ??
    resourceGroupsForTicketType(
      event?.resourceGroups ?? [],
      entryType?.id ?? null,
    );
  const resources = useReserveResourceSelection({
    groups: resourceGroups,
    quantity,
  });

  const holderErrors = useMemo(
    () =>
      holders.map((holder) => {
        const errors: { name?: string; email?: string; answers: string[] } = {
          answers: missingAnswers(questions, holder.answers),
        };
        if (!holder.name.trim()) errors.name = "Escribe el nombre";
        if (!EMAIL_RE.test(holder.email.trim())) errors.email = "Correo inválido";
        return errors;
      }),
    [holders, questions],
  );

  const duplicateEmail = useMemo(() => {
    const seen = new Set<string>();
    for (const holder of holders) {
      const key = holder.email.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) return key;
      seen.add(key);
    }
    return null;
  }, [holders]);

  const valid =
    Boolean(entryType) &&
    !duplicateEmail &&
    resources.resourcesReady &&
    holderErrors.every(
      (errors) => !errors.name && !errors.email && errors.answers.length === 0,
    );

  function updateHolder(index: number, patch: Partial<HolderDraft>) {
    setHolders((current) =>
      current.map((holder, idx) => (idx === index ? { ...holder, ...patch } : holder)),
    );
  }

  function setAnswer(index: number, questionId: string, value: string) {
    setHolders((current) =>
      current.map((holder, idx) =>
        idx === index
          ? { ...holder, answers: { ...holder.answers, [questionId]: value } }
          : holder,
      ),
    );
  }

  /**
   * Marks the form as touched and returns the holders payload when every
   * field checks out, or null after setting the error to show.
   */
  function validateDraft() {
    setTouched(true);
    setError(null);
    if (!event || !entryType) return null;
    if (duplicateEmail) {
      setError("Cada ticket necesita un correo distinto.");
      return null;
    }
    if (needsGovernmentId && !governmentIdValid) {
      setError("Escribe tu número de identidad para abrir el pago.");
      return null;
    }
    if (!valid) {
      setError(
        resources.missingGroupName
          ? `Elige tu ${resources.missingGroupName.toLowerCase()} antes de continuar.`
          : "Revisa los datos marcados antes de continuar.",
      );
      return null;
    }
    const holderPayload = holders.map((holder) => ({
      name: holder.name.trim(),
      email: holder.email.trim(),
      answers: answersToList(questions, holder.answers),
    }));
    return {
      event,
      entryType,
      holderPayload,
      firstAnswers: holderPayload[0]?.answers ?? [],
    };
  }

  type ValidDraft = NonNullable<ReturnType<typeof validateDraft>>;

  function paidOrderInput(draft: ValidDraft): InitiatePaymentInput {
    return {
      eventId: draft.event.id,
      entryTypeId: draft.entryType.id,
      quantity,
      holders: draft.holderPayload.map((holder) => ({ ...holder, invite: false })),
      answers: draft.firstAnswers,
      ...(donationAllowed && donationCents > 0 ? { donationCents } : {}),
      resourceIds: resources.selectedIds.length ? resources.selectedIds : null,
      ...(needsGovernmentId ? { governmentId: governmentId.trim() } : {}),
    };
  }

  /**
   * The paid order as the API wants it, for a settle path other than the
   * hosted link (the in-app card). Null when the form is not valid yet or
   * the ticket is free; the error state is set in the first case.
   */
  function preparePaidOrder(): InitiatePaymentInput | null {
    const draft = validateDraft();
    if (!draft || isFree) return null;
    return paidOrderInput(draft);
  }

  async function submit() {
    const draft = validateDraft();
    if (!draft) return;
    const { event, entryType, holderPayload, firstAnswers } = draft;
    setSubmitting(true);
    try {

      if (isFree) {
        const result = await reserveFreeTickets({
          eventId: event.id,
          quantity,
          ticketTypeId: entryType.id,
          holders: holderPayload,
          answers: firstAnswers,
          resourceIds: resources.selectedIds,
        });
        const ticketId = result.ticketIds?.[0];
        router.replace(
          ticketId ? `/tickets/${encodeURIComponent(ticketId)}?nuevo=1` : "/tickets",
        );
        return;
      }

      const order = await initiatePayment(paidOrderInput(draft));
      try {
        window.sessionStorage.setItem(
          paymentLinkStorageKey(order.orderId),
          order.paymentLink,
        );
      } catch {
        /* the query param below still carries it */
      }
      router.replace(
        `/pagar/${encodeURIComponent(order.orderId)}?link=${encodeURIComponent(order.paymentLink)}&event=${encodeURIComponent(event.id)}`,
      );
    } catch (err) {
      // La pasarela cambió de canal sin que la cotización lo dijera: se
      // muestra el campo y el siguiente intento ya lo lleva.
      if (isApiError(err) && err.code === GOVERNMENT_ID_REQUIRED_CODE) {
        setGovernmentIdDemanded(true);
      }
      setError(
        isApiError(err) ? err.message : "No pudimos crear la reserva. Intenta de nuevo.",
      );
      setSubmitting(false);
    }
  }

  return {
    event,
    // The list-card placeholder has no entry types; it must read as loading
    // here or the page would flash "no tickets" before the detail lands.
    isLoading: detail.isLoading || detail.isPlaceholderData,
    loadError: detail.error as Error | null,
    refetch: detail.refetch,
    availableTypes,
    entryType,
    entryTypeId,
    setEntryTypeId,
    quantity,
    setQuantity: (value: number) =>
      setQuantity(Math.min(Math.max(1, value), maxQuantity)),
    maxQuantity,
    holders,
    holderErrors,
    duplicateEmail,
    touched,
    updateHolder,
    setAnswer,
    questions,
    isFree,
    donationAllowed,
    donation,
    setDonation,
    ticketsCents,
    donationCents,
    subtotalCents,
    serviceChargeCents,
    totalCents,
    holdExpiresAt,
    resourceGroups,
    selectedResourceByGroup: resources.selected,
    onToggleResource: resources.toggle,
    hasResourceGroups: resources.hasGroups,
    missingGroupName: resources.missingGroupName,
    needsGovernmentId,
    governmentId,
    governmentIdValid,
    setGovernmentId: (value: string) => setGovernmentIdState(formatGovernmentId(value)),
    submit,
    preparePaidOrder,
    submitting,
    error,
    valid,
  };
}
