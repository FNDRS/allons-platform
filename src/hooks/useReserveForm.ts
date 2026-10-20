"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { accountNameOf, useAuth } from "@/components/app/AuthProvider";
import { deriveReserveState, useEventDetail } from "@/hooks/useEventDetail";
import { isApiError } from "@/lib/api/client";
import {
  GOVERNMENT_ID_REQUIRED_CODE,
  GOVERNMENT_ID_TAKEN_CODE,
  formatGovernmentId,
  isValidGovernmentId,
} from "@/lib/governmentId";
import {
  eventKeys,
  getEventQuote,
  getEventResources,
  isBuyerQuestion,
  requiresAccount,
  resourceGroupsForTicketType,
  isEntryTypeOnSale,
  isEntryTypeUpcoming,
  isSoldOutOption,
  type EventEntryType,
  type EventQuestion,
} from "@/lib/api/events";
import {
  cancelGuestOrder,
  guestInitiatePayment,
  readGuestBuyer,
  readGuestOrder,
  rememberGuestBuyer,
  rememberGuestOrder,
  type GuestBuyer,
} from "@/lib/api/guest";
import { PAYMENTS_OUTAGE, PAYMENTS_OUTAGE_MESSAGE } from "@/lib/paymentsOutage";
import {
  PENDING_ORDER_EXISTS_CODE,
  initiatePayment,
  paymentKeys,
  paymentLinkStorageKey,
  payOrderHref,
  rememberPendingOrder,
  type InitiatePaymentInput,
  type PendingOrderChannel,
} from "@/lib/api/payments";
import { reserveFreeTickets, type AnswerInput } from "@/lib/api/tickets";
import { useReserveResourceSelection } from "@/hooks/useReserveResourceSelection";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface HolderDraft {
  name: string;
  email: string;
  answers: Record<string, string>;
}

/** Who is buying. Ticket 1 is theirs unless they say otherwise. */
export interface BuyerDraft {
  name: string;
  email: string;
}

/**
 * The buyer's own open checkout, refused as a duplicate. With the token from
 * this browser it can be resumed or cancelled; without it, only waited out.
 */
export interface GuestPendingOrder {
  orderId: string;
  token: string | null;
  expiresAt: string | null;
  channel: PendingOrderChannel;
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

/**
 * What was typed, kept while the form is open: a reload, a trip out to the
 * bank's page or to Google and back all return to the filled form, not an
 * empty one. Same tab only; cleared once the order is placed.
 */
interface StoredDraft {
  entryTypeId: string | null;
  quantity: number;
  buyer: BuyerDraft;
  buyerAnswers: Record<string, string>;
  firstIsBuyer: boolean;
  holders: HolderDraft[];
  donation: string;
  promoCode: string | null;
  governmentId: string;
  /** Bikes or seats picked, put back once the map loads. */
  resourceIds: string[];
  at: number;
}

/** Older than this the draft is from another visit, not this one. */
const DRAFT_TTL_MS = 60 * 60 * 1000;
const DRAFT_WRITE_DELAY_MS = 400;

function draftStorageKey(eventId: string) {
  return `allons-reserve-draft:${eventId}`;
}

function readStoredDraft(eventId: string): StoredDraft | null {
  try {
    const raw = window.sessionStorage.getItem(draftStorageKey(eventId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as StoredDraft;
    if (!Array.isArray(draft.holders) || Date.now() - draft.at > DRAFT_TTL_MS) {
      window.sessionStorage.removeItem(draftStorageKey(eventId));
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

/**
 * Forgets what was typed for this event. Called once the order is paid, not
 * when it is created: a reload during the bank's verification, or a retry
 * after a decline, must find the form as it was.
 */
export function clearReserveDraft(eventId: string) {
  try {
    window.sessionStorage.removeItem(draftStorageKey(eventId));
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

/**
 * Answers that block the purchase for one holder, by question id: required
 * ones left empty, and any pick whose option ran out since it was chosen.
 */
export function missingAnswers(
  questions: EventQuestion[],
  answers: Record<string, string>,
): string[] {
  return questions
    .filter((question) => {
      const value = (answers[question.id] ?? "").trim();
      if (value && isSoldOutOption(question, value)) return true;
      if (!question.required) return false;
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
export function useReserveForm(
  eventId: string,
  initialEntryTypeId?: string | null,
  /** Runs the invisible anti-bot check for a guest; null token when not configured. */
  proveHuman?: () => Promise<string | null>,
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const detail = useEventDetail(eventId);
  const event = detail.event;

  const [entryTypeId, setEntryTypeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyer, setBuyer] = useState<BuyerDraft>({ name: "", email: "" });
  const [buyerAnswers, setBuyerAnswers] = useState<Record<string, string>>({});
  // Ticket 1 goes to the buyer unless they name someone else for it, so the
  // common case (buying for yourself) types each thing once.
  const [firstIsBuyer, setFirstIsBuyer] = useState(true);
  const [holders, setHolders] = useState<HolderDraft[]>([emptyHolder()]);
  const [donation, setDonation] = useState("");
  // Required whenever the event is in a campaign: its hub reads attendee data.
  // Stored against the exact set shown, so a campaign added later is never
  // covered by an earlier tick.
  const [acceptedCampaignKey, setAcceptedCampaignKey] = useState<string | null>(null);
  /** Lo que el comprador está escribiendo, antes de confirmar "Aplicar". */
  const [promoCodeDraft, setPromoCodeDraft] = useState("");
  /** El código que de verdad viaja en la cotización, una vez confirmado. */
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Identidad de quien paga. Clinpays la exige para abrir su formulario. */
  const [governmentId, setGovernmentIdState] = useState("");
  /** La API la pidió al iniciar: la cotización no lo sabía o cambió la pasarela. */
  const [governmentIdDemanded, setGovernmentIdDemanded] = useState(false);
  /** El número que la pasarela rechazó y por qué, para marcarlo en el campo. */
  const [governmentIdRejection, setGovernmentIdRejection] = useState<{
    value: string;
    message: string;
  } | null>(null);
  /** A guest's own open checkout the API refused to duplicate. */
  const [guestPending, setGuestPending] = useState<GuestPendingOrder | null>(null);
  /** Picks from the draft, handed to the map once it loads. */
  const [restoredResourceIds, setRestoredResourceIds] = useState<string[] | null>(null);
  // Set once the stored draft (or its absence) has been read, so the
  // periodic write below never saves the empty initial state over it.
  const restored = useRef(false);
  // The buyer typed (or a draft restored) their own details: the account's
  // name no longer overrides them, only its email does.
  const buyerEdited = useRef(false);
  // The bike/seat picks live in the resource hook, declared further down;
  // the draft reads them through a ref and re-saves when they change.
  const selectedResourceIdsRef = useRef<string[]>([]);
  const [selectedResourceKey, setSelectedResourceKey] = useState("");

  // Not a guest until the session has been read: a signed-in buyer who
  // reloads must not be sent through the guest endpoints meanwhile.
  const isGuest = !authLoading && !user;

  const reserveKind =
    event && !detail.isPlaceholderData ? deriveReserveState(event).kind : null;
  // Sale has not opened. The form is a preview: every step is usable, and
  // nothing is held or charged.
  const preview = reserveKind === "preview";

  const availableTypes = useMemo(() => {
    // Same gate as the detail CTA: a finished or sold-out event sells nothing,
    // whatever a stale tier row says. A preview still lists the tiers whose
    // sale has not opened, so the buyer can see the selection.
    if (!event || reserveKind === "closed" || reserveKind === null) return [];
    const now = Date.now();
    return (event.entryTypes ?? []).filter((type) => {
      if (type.soldOut || type.remaining === 0) return false;
      if (isEntryTypeOnSale(type, now)) return true;
      return preview && isEntryTypeUpcoming(type, now);
    });
  }, [event, reserveKind, preview]);

  // Pick the tier they opened, or the first one, so the selection is visible.
  useEffect(() => {
    if (availableTypes.length === 0) return;
    setEntryTypeId((current) => {
      if (current && availableTypes.some((type) => type.id === current)) return current;
      if (
        initialEntryTypeId &&
        availableTypes.some((type) => type.id === initialEntryTypeId)
      ) {
        return initialEntryTypeId;
      }
      return availableTypes[0].id;
    });
  }, [availableTypes, initialEntryTypeId]);

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

  // Back on the page (a reload, the bank, Google): put back what they had.
  // Without a draft, a guest who bought here before starts with their name
  // and email already in.
  useEffect(() => {
    const draft = readStoredDraft(eventId);
    if (draft) {
      buyerEdited.current = true;
      setEntryTypeId(draft.entryTypeId);
      setQuantity(Math.min(Math.max(1, draft.quantity), MAX_QUANTITY));
      setBuyer(draft.buyer ?? { name: "", email: "" });
      setBuyerAnswers(draft.buyerAnswers ?? {});
      setFirstIsBuyer(draft.firstIsBuyer ?? true);
      setHolders(draft.holders.length ? draft.holders : [emptyHolder()]);
      setDonation(draft.donation);
      setPromoCode(draft.promoCode);
      setPromoCodeDraft(draft.promoCode ?? "");
      setGovernmentIdState(draft.governmentId);
      if (Array.isArray(draft.resourceIds) && draft.resourceIds.length > 0) {
        setRestoredResourceIds(draft.resourceIds);
      }
    } else {
      const remembered = readGuestBuyer();
      if (remembered) setBuyer(remembered);
    }
    restored.current = true;
  }, [eventId]);

  // Signed in: the account is the buyer. Its email always wins (the receipt
  // goes there whatever is typed); its name fills in unless the buyer wrote
  // one, so a guest name remembered on this device never shows for an account.
  useEffect(() => {
    if (!user) return;
    setBuyer((current) => ({
      // The account's own name only (Google, or what was typed when the
      // account was created). An account without one leaves the field
      // empty, and it is asked for before paying, not filled from the email.
      name: buyerEdited.current && current.name ? current.name : (accountNameOf(user) ?? ""),
      email: user.email ?? current.email,
    }));
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

  // Keep the draft while the form is open, a moment after each change.
  useEffect(() => {
    if (!restored.current) return;
    const timer = window.setTimeout(() => {
      const draft: StoredDraft = {
        entryTypeId,
        quantity,
        buyer,
        buyerAnswers,
        firstIsBuyer,
        holders,
        donation,
        promoCode,
        governmentId,
        resourceIds: selectedResourceIdsRef.current,
        at: Date.now(),
      };
      try {
        window.sessionStorage.setItem(draftStorageKey(eventId), JSON.stringify(draft));
      } catch {
        /* private mode: they fill it again */
      }
    }, DRAFT_WRITE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [
    eventId,
    entryTypeId,
    quantity,
    buyer,
    buyerAnswers,
    firstIsBuyer,
    holders,
    donation,
    promoCode,
    governmentId,
    selectedResourceKey,
  ]);

  const questions = useMemo(
    () => [...(event?.questions ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [event],
  );
  // Asked once per order (about the purchase) or once per ticket (about
  // the attendee), as the comercio configured each one.
  const buyerQuestions = useMemo(() => questions.filter(isBuyerQuestion), [questions]);
  const attendeeQuestions = useMemo(
    () => questions.filter((question) => !isBuyerQuestion(question)),
    [questions],
  );
  const campaigns = useMemo(() => event?.campaigns ?? [], [event]);
  const campaignKey = campaigns.length
    ? `${eventId}:${campaigns
        .map((c) => c.id)
        .sort()
        .join(",")}`
    : "";
  const campaignConsent = campaignKey !== "" && acceptedCampaignKey === campaignKey;
  // Only the campaigns shown here: the API records consent for these alone.
  const consentedCampaignIds = campaignConsent ? campaigns.map((c) => c.id) : [];

  const isFree =
    event?.ticketMode === "free" || (entryType ? entryType.priceCents === 0 : false);
  const donationCents = Math.max(0, Math.round((Number(donation) || 0) * 100));
  const donationAllowed = Boolean(entryType?.donationEnabled) && !isFree;
  // One ticket type per order, so its own suggestion is the one to offer.
  const suggestedDonationCents = donationAllowed
    ? (entryType?.suggestedDonationCents ?? null)
    : null;
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
    if (preview) {
      setHold(null);
      clearStoredHold(eventId);
      return;
    }
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
  }, [selectionKnown, preview, hasPaidSelection, paidTypesExist, entryTypeId, eventId]);
  const holdExpiresAt = hold?.eventId === eventId ? hold.expiresAt : null;

  // The clock ran out on this visit. Leave the form and land on the event.
  useEffect(() => {
    if (!holdExpiresAt) return;
    const remaining = new Date(holdExpiresAt).getTime() - Date.now();
    if (!Number.isFinite(remaining)) return;
    const leave = () => {
      clearStoredHold(eventId);
      router.replace(`/eventos/${encodeURIComponent(eventId)}`);
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
      promoCode,
    ),
    queryFn: () =>
      getEventQuote(eventId, {
        entryTypeId: entryType?.id ?? null,
        quantity,
        donationCents: donationAllowed ? donationCents : 0,
        discountCode: promoCode,
      }),
    enabled: Boolean(eventId) && Boolean(entryType) && !isFree,
    staleTime: 60_000,
  });
  const serviceChargeCents = quoteQuery.data?.serviceChargeCents ?? 0;
  const totalCents = quoteQuery.data?.totalCents ?? subtotalCents;
  const discount = quoteQuery.data?.discount ?? null;
  const promoApplying = Boolean(promoCode) && quoteQuery.isFetching;
  // Un ticket pago cuyo código lo cubre al 100% se cobra L 0: el servidor lo
  // liquida sin pasarela, así que el checkout se comporta como el de una
  // entrada gratuita (sin tarjeta, sin identidad) aunque el tipo no lo sea.
  const effectivelyFree =
    !isFree && Boolean(quoteQuery.data) && totalCents === 0;

  // Un código sólo se manda cuando el comprador presiona "Aplicar". Si el
  // servidor lo rechaza (vencido, agotado, de otro comercio), la cotización
  // vuelve a la de antes en vez de quedarse pegada a un pedido que falla.
  useEffect(() => {
    if (!promoCode || !quoteQuery.isError) return;
    setPromoError(
      isApiError(quoteQuery.error)
        ? quoteQuery.error.message
        : "No pudimos aplicar el código.",
    );
    setPromoCode(null);
  }, [promoCode, quoteQuery.isError, quoteQuery.error]);

  function applyPromoCode() {
    const code = promoCodeDraft.trim().toUpperCase();
    if (!code) return;
    setPromoError(null);
    setPromoCode(code);
  }

  function removePromoCode() {
    setPromoCode(null);
    setPromoCodeDraft("");
    setPromoError(null);
  }
  // Clinpays no abre su formulario sin identidad. La cotización lo avisa de
  // antemano; si fue la API quien lo pidió, el formulario lo recuerda. Un
  // código que deja el total en 0 nunca abre ese formulario, así que anula
  // el recuerdo aunque venga de un intento anterior sin el código.
  const needsGovernmentId =
    !isFree &&
    !effectivelyFree &&
    (quoteQuery.data?.requiresGovernmentId === true || governmentIdDemanded);
  const governmentIdValid = isValidGovernmentId(governmentId);

  const resourceQuery = useQuery({
    queryKey: eventKeys.resources(eventId, entryType?.id ?? null),
    queryFn: () =>
      getEventResources(eventId, entryType?.id ?? null).then(
        (res) => res.groups,
      ),
    enabled: Boolean(eventId) && Boolean(entryType),
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
  const fallbackResourceGroups = useMemo(
    () =>
      resourceGroupsForTicketType(
        event?.resourceGroups ?? [],
        entryType?.id ?? null,
      ),
    [event?.resourceGroups, entryType?.id],
  );
  // El detalle del evento trae los mapas de todos los horarios: sirve de
  // respaldo mientras carga el mapa en vivo, filtrado con la misma regla.
  const resourceGroups = resourceQuery.data ?? fallbackResourceGroups;
  const resources = useReserveResourceSelection({
    groups: resourceGroups,
    quantity,
    restoreIds: restoredResourceIds,
  });
  const selectedIdsKey = resources.selectedIds.join("|");
  useEffect(() => {
    selectedResourceIdsRef.current = resources.selectedIds;
    setSelectedResourceKey(selectedIdsKey);
    // selectedIds is the array behind the key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdsKey]);
  const quoteReady = isFree || Boolean(quoteQuery.data);
  const resourcesLoaded = resourceQuery.isSuccess;
  const paymentDataLoading = Boolean(entryType) && (
    resourceQuery.isLoading || (!isFree && quoteQuery.isLoading)
  );
  // The resource map refetches every 10s and a stale quote refetches on
  // focus. While either request is in flight the data on screen may be about
  // to change, so nothing is charged against it. Kept apart from the first
  // load so the CTA can block without flashing a spinner every 10 seconds.
  const paymentDataRefreshing =
    Boolean(entryType) &&
    !paymentDataLoading &&
    (resourceQuery.isFetching || (!isFree && quoteQuery.isFetching));

  const buyerName = buyer.name.trim();
  const buyerEmail = buyer.email.trim();
  // Full checkout before signing in: the account will bring the email and,
  // with Google, the name. Neither is asked for yet; what is missing after
  // the sign-in is flagged then, by the pay button.
  const accountPending = isGuest && (requiresAccount(event) || isFree);
  const buyerErrors = useMemo(() => {
    const errors: { name?: string; email?: string; answers: string[] } = {
      answers: missingAnswers(buyerQuestions, buyerAnswers),
    };
    if (!accountPending && buyerName.length < 2) errors.name = "Escribe tu nombre completo";
    if (!accountPending && !EMAIL_RE.test(buyerEmail)) errors.email = "Revisa el correo";
    return errors;
  }, [buyerName, buyerEmail, buyerQuestions, buyerAnswers, accountPending]);
  const buyerValid = !buyerErrors.name && !buyerErrors.email && buyerErrors.answers.length === 0;

  // Ticket 1 as it will be issued: the buyer's, unless they named someone.
  const effectiveHolders = useMemo(
    () =>
      holders.map((holder, index) =>
        index === 0 && firstIsBuyer
          ? { ...holder, name: buyerName, email: buyerEmail }
          : holder,
      ),
    [holders, firstIsBuyer, buyerName, buyerEmail],
  );

  const holderErrors = useMemo(
    () =>
      effectiveHolders.map((holder, index) => {
        const errors: { name?: string; email?: string; answers: string[] } = {
          answers: missingAnswers(attendeeQuestions, holder.answers),
        };
        // Ticket 1's identity comes from the buyer step, and is flagged there.
        if (index === 0 && firstIsBuyer) return errors;
        if (!holder.name.trim()) errors.name = "Escribe el nombre";
        if (!EMAIL_RE.test(holder.email.trim())) errors.email = "Correo inválido";
        return errors;
      }),
    [effectiveHolders, attendeeQuestions, firstIsBuyer],
  );

  const duplicateEmail = useMemo(() => {
    const seen = new Set<string>();
    for (const holder of effectiveHolders) {
      const key = holder.email.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) return key;
      seen.add(key);
    }
    return null;
  }, [effectiveHolders]);

  const valid =
    Boolean(entryType) &&
    holders.length === quantity &&
    quoteReady &&
    resourcesLoaded &&
    !duplicateEmail &&
    buyerValid &&
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

  function setBuyerAnswer(questionId: string, value: string) {
    setBuyerAnswers((current) => ({ ...current, [questionId]: value }));
  }

  /**
   * Marks the form as touched and returns the holders payload when every
   * field checks out, or null after setting the error to show.
   */
  function validateDraft({ inAppCard = false }: { inAppCard?: boolean } = {}) {
    setTouched(true);
    setError(null);
    if (!event || !entryType) return null;
    if (authLoading) {
      setError("Un momento, estamos cargando tu sesión.");
      return null;
    }
    if (!isFree && PAYMENTS_OUTAGE) {
      setError(PAYMENTS_OUTAGE_MESSAGE);
      return null;
    }
    if (holders.length !== quantity) {
      setError("Espera un momento y vuelve a intentar.");
      return null;
    }
    if (!isFree && quoteQuery.isFetching) {
      setError("Estamos confirmando el total. Intenta de nuevo en un momento.");
      return null;
    }
    if (!isFree && quoteQuery.isError) {
      setError(
        isApiError(quoteQuery.error)
          ? quoteQuery.error.message
          : "No pudimos confirmar el total del evento.",
      );
      return null;
    }
    if (resourceQuery.isFetching) {
      setError("Estamos confirmando disponibilidad. Intenta de nuevo en un momento.");
      return null;
    }
    if (resourceQuery.isError) {
      setError(
        isApiError(resourceQuery.error)
          ? resourceQuery.error.message
          : "No pudimos confirmar la disponibilidad del evento.",
      );
      return null;
    }
    if (campaigns.length > 0 && !campaignConsent) {
      setError("Acepta compartir los datos con la campaña para continuar.");
      return null;
    }
    if (!buyerValid) {
      setError("Revisa tus datos antes de continuar.");
      return null;
    }
    if (duplicateEmail) {
      setError("Cada ticket necesita un correo distinto.");
      return null;
    }
    // Only Clinpays' own page needs it; an in-app card carries the DNI in
    // the card form, and a saved card's customer already has one.
    if (!inAppCard && needsGovernmentId && !governmentIdValid) {
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
    const holderPayload = effectiveHolders.map((holder) => ({
      name: holder.name.trim(),
      email: holder.email.trim(),
      answers: answersToList(attendeeQuestions, holder.answers),
    }));
    return {
      event,
      entryType,
      holderPayload,
      // What the buyer answered about the purchase itself, once per order.
      buyerAnswers: answersToList(buyerQuestions, buyerAnswers),
      buyer: { name: buyerName, email: buyerEmail } satisfies GuestBuyer,
    };
  }

  type ValidDraft = NonNullable<ReturnType<typeof validateDraft>>;

  function paidOrderInput(
    draft: ValidDraft,
    { inAppCard = false }: { inAppCard?: boolean } = {},
  ): InitiatePaymentInput {
    return {
      eventId: draft.event.id,
      entryTypeId: draft.entryType.id,
      quantity,
      holders: draft.holderPayload.map((holder) => ({ ...holder, invite: false })),
      answers: draft.buyerAnswers,
      ...(donationAllowed && donationCents > 0 ? { donationCents } : {}),
      ...(promoCode ? { discountCode: promoCode } : {}),
      ...(resources.selectedIds.length ? { resourceIds: resources.selectedIds } : {}),
      ...(needsGovernmentId && !inAppCard ? { governmentId: governmentId.trim() } : {}),
      consentedCampaignIds,
    };
  }

  /**
   * The paid order as the API wants it, for a settle path other than the
   * hosted link (the in-app card). Null when the form is not valid yet or
   * the ticket is free; the error state is set in the first case.
   */
  function preparePaidOrder(): InitiatePaymentInput | null {
    if (preview) return null;
    const draft = validateDraft({ inAppCard: true });
    if (!draft || isFree) return null;
    return paidOrderInput(draft, { inAppCard: true });
  }

  /**
   * Checks the form before the sign-in modal opens on a full checkout, so a
   * missing size or name is pointed out now and not after creating the
   * account. The email is not asked yet; the account brings it.
   */
  function validateForAccount(): boolean {
    return validateDraft({ inAppCard: true }) !== null;
  }

  /** The name the sign-in modal collected, when the account had none. */
  function setBuyerNameFromAccount(name: string) {
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) return;
    buyerEdited.current = true;
    setBuyer((current) => ({ ...current, name: clean }));
  }

  /** The buyer as the guest endpoints want them, once the form checks out. */
  function guestBuyer(): GuestBuyer | null {
    return buyerValid ? { name: buyerName, email: buyerEmail } : null;
  }

  /**
   * The order was placed. The draft stays until the order is paid (the pay
   * page clears it), so a bank verification or a declined card brings the
   * buyer back to a filled form. Only a guest's details are remembered for
   * the next purchase; an account's name and email must not show up for the
   * next person on a shared device.
   */
  function orderPlaced(buyerInfo: GuestBuyer) {
    if (isGuest) rememberGuestBuyer(buyerInfo);
  }

  /**
   * A guest's own checkout is still open and the API refused another. With
   * its token from this browser it can be resumed or dropped; otherwise it
   * is waited out. True when the notice now covers the error.
   */
  function noteGuestPending(err: unknown): boolean {
    if (!isGuest || !isApiError(err) || err.code !== PENDING_ORDER_EXISTS_CODE) return false;
    const details = err.details ?? {};
    const orderId = typeof details.orderId === "string" ? details.orderId : null;
    if (!orderId) return false;
    const stored = readGuestOrder(orderId);
    setGuestPending({
      orderId,
      token: stored?.token ?? null,
      expiresAt: typeof details.expiresAt === "string" ? details.expiresAt : null,
      channel: details.channel === "card" ? "card" : "link",
    });
    return true;
  }

  async function submit() {
    if (preview) return;
    const draft = validateDraft();
    if (!draft) return;
    const { event, entryType, holderPayload, buyerAnswers: orderAnswers } = draft;
    setSubmitting(true);
    setGuestPending(null);
    try {
      if (isFree) {
        const result = await reserveFreeTickets({
          eventId: event.id,
          quantity,
          ticketTypeId: entryType.id,
          holders: holderPayload,
          answers: orderAnswers,
          ...(resources.selectedIds.length ? { resourceIds: resources.selectedIds } : {}),
          consentedCampaignIds,
        });
        orderPlaced(draft.buyer);
        clearReserveDraft(eventId);
        const ticketId = result.ticketIds?.[0];
        router.replace(
          ticketId ? `/tickets/${encodeURIComponent(ticketId)}?nuevo=1` : "/tickets",
        );
        return;
      }

      const input = paidOrderInput(draft);
      let order;
      if (isGuest) {
        const turnstileToken = proveHuman ? await proveHuman() : null;
        const placed = await guestInitiatePayment({
          ...input,
          buyer: draft.buyer,
          ...(turnstileToken ? { turnstileToken } : {}),
        });
        // Null when the API could not store it: the receipt mail is then
        // the way to the ticket, and /pagar says so.
        if (placed.guestToken) {
          rememberGuestOrder(placed.orderId, {
            token: placed.guestToken,
            eventId: event.id,
            email: placed.buyerEmail,
          });
        }
        order = placed;
      } else {
        order = await initiatePayment(input);
      }
      orderPlaced(draft.buyer);
      // Null when a promo code covered the total: the order is already
      // settled, there is no Paygate link to open, and `/pagar` reads that
      // straight off the order status without needing one.
      if (!order.paymentLink) {
        router.replace(
          `/pagar/${encodeURIComponent(order.orderId)}?event=${encodeURIComponent(event.id)}`,
        );
        return;
      }
      try {
        window.sessionStorage.setItem(
          paymentLinkStorageKey(order.orderId),
          order.paymentLink,
        );
      } catch {
        /* the query param below still carries it */
      }
      // Coming back to this page should offer this order, not a cached "none".
      if (!isGuest) {
        queryClient.setQueryData(paymentKeys.active(event.id), {
          orderId: order.orderId,
          paymentLink: order.paymentLink,
          expiresAt: order.expiresAt,
        });
      }
      router.replace(payOrderHref(order.orderId, event.id, order.paymentLink));
    } catch (err) {
      if (noteGuestPending(err)) {
        setSubmitting(false);
        return;
      }
      // Su propio pago con tarjeta sigue esperando al banco: lo explica el
      // aviso junto al botón de pagar, con el tiempo que falta.
      if (!isGuest && rememberPendingOrder(queryClient, eventId, err)) {
        setSubmitting(false);
        return;
      }
      // La pasarela cambió de canal sin que la cotización lo dijera: se
      // muestra el campo y el siguiente intento ya lo lleva.
      if (isApiError(err) && err.code === GOVERNMENT_ID_REQUIRED_CODE) {
        setGovernmentIdDemanded(true);
      }
      // Clinpays tiene ese número con otro correo. El error va solo en el
      // campo, para que se vea qué corregir y no se anuncie dos veces, y se
      // quita al cambiar el número.
      if (isApiError(err) && err.code === GOVERNMENT_ID_TAKEN_CODE) {
        setGovernmentIdRejection({ value: governmentId.trim(), message: err.message });
        setError(null);
        setSubmitting(false);
        return;
      }
      setError(
        isApiError(err)
          ? err.message
          : err instanceof Error && err.message
            ? err.message
            : "No pudimos crear la reserva. Intenta de nuevo.",
      );
      setSubmitting(false);
    }
  }

  /** Drops the guest's open checkout so a new one can start right away. */
  async function dropGuestPending() {
    if (!guestPending?.token) return;
    setSubmitting(true);
    try {
      await cancelGuestOrder(guestPending.orderId, guestPending.token);
      setGuestPending(null);
    } catch (err) {
      // Already closed (paid, expired) reads as done: the next submit says
      // what the API thinks now.
      if (isApiError(err) && err.status === 400) {
        setGuestPending(null);
      } else {
        setError(
          isApiError(err) ? err.message : "No pudimos cancelar el pago anterior.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  /** Keeps what was typed for the trip out to sign in and back. */
  function saveDraft() {
    const draft: StoredDraft = {
      entryTypeId,
      quantity,
      buyer,
      buyerAnswers,
      firstIsBuyer,
      holders,
      donation,
      promoCode,
      governmentId,
      resourceIds: resources.selectedIds,
      at: Date.now(),
    };
    try {
      window.sessionStorage.setItem(draftStorageKey(eventId), JSON.stringify(draft));
    } catch {
      /* private mode: they fill it again */
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
    preview,
    isGuest,
    entryType,
    entryTypeId,
    setEntryTypeId,
    saveDraft,
    quantity,
    setQuantity: (value: number) =>
      setQuantity(Math.min(Math.max(1, value), maxQuantity)),
    maxQuantity,
    buyer,
    setBuyer: (patch: Partial<BuyerDraft>) => {
      buyerEdited.current = true;
      setBuyer((current) => ({ ...current, ...patch }));
    },
    buyerErrors,
    buyerQuestions,
    buyerAnswers,
    setBuyerAnswer,
    firstIsBuyer,
    setFirstIsBuyer,
    holders: effectiveHolders,
    holderErrors,
    duplicateEmail,
    touched,
    updateHolder,
    setAnswer,
    questions: attendeeQuestions,
    isFree,
    effectivelyFree,
    donationAllowed,
    donation,
    setDonation,
    suggestedDonationCents,
    ticketsCents,
    donationCents,
    subtotalCents,
    serviceChargeCents,
    totalCents,
    discount,
    promoCodeDraft,
    setPromoCodeDraft,
    promoApplying,
    promoError,
    applyPromoCode,
    removePromoCode,
    holdExpiresAt,
    campaigns,
    campaignConsent,
    setCampaignConsent: (value: boolean) =>
      setAcceptedCampaignKey(value ? campaignKey : null),
    resourceGroups,
    selectedResourceByGroup: resources.selected,
    onToggleResource: resources.toggle,
    hasResourceGroups: resources.hasGroups,
    missingGroupName: resources.missingGroupName,
    paymentDataLoading,
    paymentDataRefreshing,
    needsGovernmentId,
    /** The quote says the card can be charged here without saving it. */
    cardPaymentEnabled: quoteQuery.data?.cardPaymentEnabled === true,
    governmentId,
    governmentIdValid,
    governmentIdRejectedMessage:
      governmentIdRejection && governmentIdRejection.value === governmentId.trim()
        ? governmentIdRejection.message
        : null,
    setGovernmentId: (value: string) => setGovernmentIdState(formatGovernmentId(value)),
    submit,
    preparePaidOrder,
    validateForAccount,
    setBuyerNameFromAccount,
    guestBuyer,
    orderPlaced,
    noteGuestPending,
    guestPending,
    dropGuestPending,
    clearGuestPending: () => setGuestPending(null),
    submitting,
    error,
    valid,
  };
}
