"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/client";
import {
  createProviderEvent,
  createProviderTicketType,
  deleteProviderTicketType,
  providerKeys,
  updateProviderEvent,
  updateProviderTicketType,
  type ProviderEventDetail,
  type ProviderEventInput,
} from "@/lib/api/provider";
import { EVENT_CATEGORIES, EVENT_OTHER_CATEGORY } from "@/lib/eventCategories";
import { isLiveEventStatus } from "@/lib/eventStatus";
import { todayHN } from "@/lib/dateKeys";
import { hnToIso, isoToHn } from "./event-form/time";
import { useEventPin } from "./event-form/useEventPin";
import { useEventTicketsForm } from "./event-form/useEventTicketsForm";

export type EventSaveTarget = "draft" | "published";
export type RefundPolicy = ProviderEventInput["refundPolicy"];

const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Readable message for a failed event save. */
export function eventSaveErrorMessage(error: unknown): string {
  if (isApiError(error) && error.status === 403) {
    return "Tu rol no permite crear ni editar eventos. Pide acceso a quien administra el comercio.";
  }
  return error instanceof Error ? error.message : "Intenta de nuevo en un momento.";
}

/** A category the list knows, or "Otro" with the custom name kept apart. */
function splitCategory(category: string | null | undefined) {
  if (!category) return { category: "", custom: "" };
  return EVENT_CATEGORIES.includes(category)
    ? { category, custom: "" }
    : { category: EVENT_OTHER_CATEGORY, custom: category };
}

/**
 * Create or edit a comercio event with its ticket types. `event` seeds the
 * fields once, so mount the form only after it has loaded.
 *
 * Sending `published` never publishes on its own: the API stores
 * `pending_review` until an Allons admin approves it, unless the event is
 * already public, in which case the edit keeps it public.
 */
export function useEventForm(event: ProviderEventDetail | null) {
  const client = useQueryClient();
  const router = useRouter();

  // Set once the event exists on the server, also when a first save failed
  // halfway (event created, a ticket refused): a retry then patches it
  // instead of creating a second event.
  const [savedId, setSavedId] = useState<string | null>(event?.id ?? null);
  const [savedStatus, setSavedStatus] = useState<string>(event?.status ?? "draft");

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const initialCategory = splitCategory(event?.category);
  const [category, setCategory] = useState(initialCategory.category);
  const [customCategory, setCustomCategory] = useState(initialCategory.custom);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(event?.coverImageUrl ?? null);
  const [coverBusy, setCoverBusy] = useState(false);

  const start = isoToHn(event?.startsAt);
  const end = isoToHn(event?.endsAt);
  const [startDate, setStartDate] = useState(start.date);
  const [startTime, setStartTime] = useState(start.time);
  const [endDate, setEndDate] = useState(end.date);
  const [endTime, setEndTime] = useState(end.time);

  const [venue, setVenue] = useState(event?.venue ?? "");
  const [address, setAddress] = useState(event?.address ?? "");
  const [city, setCity] = useState(event?.city ?? "");
  const location = useEventPin(
    event?.latitude != null && event?.longitude != null
      ? { latitude: event.latitude, longitude: event.longitude }
      : null,
    // Only fills what is still blank: a typed address beats the geocoder's.
    (place) => {
      if (place.address) setAddress((prev) => (prev.trim() ? prev : place.address));
      const placeCity = place.city;
      if (placeCity) setCity((prev) => (prev.trim() ? prev : placeCity));
    },
  );

  const [capacity, setCapacity] = useState(
    event && event.capacity > 0 ? String(event.capacity) : "",
  );
  const [refundPolicy, setRefundPolicy] = useState<RefundPolicy>(
    event?.refundPolicy === "partial" || event?.refundPolicy === "full"
      ? event.refundPolicy
      : "none",
  );
  const [refundPartialPct, setRefundPartialPct] = useState(
    event?.refundPartialPct != null ? String(event.refundPartialPct) : "50",
  );
  const [refundDeadlineDays, setRefundDeadlineDays] = useState(
    event?.refundDeadlineDays != null ? String(event.refundDeadlineDays) : "2",
  );
  const [minAge, setMinAge] = useState(event?.minAge ? String(event.minAge) : "");
  const [smokingAllowed, setSmokingAllowed] = useState(Boolean(event?.smokingAllowed));
  const [petFriendly, setPetFriendly] = useState(Boolean(event?.petFriendly));
  const [parkingAvailable, setParkingAvailable] = useState(Boolean(event?.parkingAvailable));
  const [kitPickupInfo, setKitPickupInfo] = useState(event?.kitPickupInfo ?? "");

  const [savingTarget, setSavingTarget] = useState<EventSaveTarget | null>(null);
  const tickets = useEventTicketsForm(event?.ticketTypes ?? []);

  // With a pin the API works the city out from it, so the typed address and
  // city become optional.
  const pinned = location.pin !== null;
  const isLive = isLiveEventStatus(savedStatus);

  const startsAt = hnToIso(startDate, startTime);
  const endsAt = hnToIso(endDate || startDate, endTime);
  const today = todayHN();
  // Dates already set on an existing event stay pickable even once past.
  const minDate = start.date && start.date < today ? start.date : today;
  const resolvedCategory =
    category === EVENT_OTHER_CATEGORY ? customCategory.trim() : category;

  const isSaving = savingTarget !== null;
  const canSaveDraft = title.trim().length > 0 && !coverBusy && !isSaving;

  const missingForReview = [
    // What a reviewer needs to approve it. An event already public (often
    // made in the app, where these are optional) is not held to them.
    !isLive && !description.trim() ? "la descripción" : null,
    !isLive && !resolvedCategory ? "la categoría" : null,
    !isLive && !coverImageUrl ? "la portada" : null,
    !startsAt ? "la fecha y hora de inicio" : null,
    startsAt && !isLive && new Date(startsAt).getTime() < Date.now()
      ? "una fecha de inicio que no haya pasado"
      : null,
    !endsAt ? "la hora de fin" : null,
    startsAt && endsAt && endsAt <= startsAt ? "que el fin sea después del inicio" : null,
    !venue.trim() ? "el nombre del lugar" : null,
    !pinned && !address.trim() ? "la dirección" : null,
    !pinned && !city.trim() ? "la ciudad" : null,
    !tickets.hasTickets ? "una entrada" : null,
    ...(startDate ? tickets.windowProblems(startDate, startsAt) : []),
  ].filter((item): item is string => item !== null);

  // A draft can be incomplete, but a paid entry still needs a date to know
  // until when it sells, and the API checks it on every save.
  const missingForDraft = [
    tickets.hasPaidTickets && !startsAt ? "la fecha y hora de inicio" : null,
    ...(startDate ? tickets.windowProblems(startDate, startsAt) : []),
  ].filter((item): item is string => item !== null);

  const canSubmit = canSaveDraft && missingForReview.length === 0;

  const buildFields = (): Omit<ProviderEventInput, "status"> => {
    const paid = tickets.hasPaidTickets;
    const refund: RefundPolicy = paid ? refundPolicy : "none";
    const typedCapacity = Number(capacity);
    const fields: Omit<ProviderEventInput, "status"> = {
      title: title.trim(),
      description: description.trim() || null,
      startsAt,
      endsAt: startsAt && endsAt && endsAt > startsAt ? endsAt : null,
      venue: venue.trim() || null,
      coverImageUrl,
      category: resolvedCategory || null,
      eventType: "single",
      ticketMode: paid ? "single_access" : "free",
      // Blank falls back to the entries on sale, the most that can come in.
      capacity: typedCapacity > 0 ? typedCapacity : tickets.capacityFromTickets,
      refundPolicy: refund,
      refundPartialPct:
        refund === "partial"
          ? Math.max(1, Math.min(99, Number(refundPartialPct) || 50))
          : null,
      refundDeadlineDays: refund === "none" ? null : Math.max(0, Number(refundDeadlineDays) || 0),
      minAge: Number(minAge) > 0 ? Number(minAge) : null,
      smokingAllowed,
      petFriendly,
      parkingAvailable,
      kitPickupInfo: kitPickupInfo.trim().slice(0, 2000),
    };
    fields.address = address.trim() || null;
    fields.city = city.trim() || null;
    if (location.changed) {
      fields.latitude = location.pin?.latitude ?? null;
      fields.longitude = location.pin?.longitude ?? null;
    }
    // The app keeps its images in the gallery with the cover first, so a new
    // cover takes the old one's place there and the rest stay in order.
    const gallery = (event?.gallery ?? []).map((item) => item.url);
    const previousCover = event?.coverImageUrl ?? null;
    if (!event) {
      fields.gallery = coverImageUrl ? [coverImageUrl] : [];
    } else if (coverImageUrl !== previousCover) {
      const rest = gallery.filter((url) => url !== previousCover && url !== coverImageUrl);
      fields.gallery = coverImageUrl ? [coverImageUrl, ...rest] : rest;
    }
    return fields;
  };

  /**
   * Tickets have no bulk endpoint, so they go one request each, in order.
   * Creating returns the whole list, so the new row is the id not seen yet.
   * Each write that lands is recorded at once, so a retry patches it.
   */
  const syncTickets = async (eventId: string, knownIds: Set<string>) => {
    const diff = tickets.toDiff(startsAt);
    for (const id of diff.removeIds) {
      await deleteProviderTicketType(id);
      tickets.markDeleted(id);
      knownIds.delete(id);
    }
    for (const { id, payload } of diff.update) {
      await updateProviderTicketType(id, payload);
    }
    for (const { draftId, payload } of diff.create) {
      const list = await createProviderTicketType(eventId, payload);
      const fresh = list.filter((row) => !knownIds.has(row.id));
      if (fresh.length === 1) {
        tickets.markPersisted(draftId, fresh[0].id);
        knownIds.add(fresh[0].id);
      } else {
        list.forEach((row) => knownIds.add(row.id));
      }
    }
  };

  const save = async (target: EventSaveTarget) => {
    if (target === "published" ? !canSubmit : !canSaveDraft || missingForDraft.length > 0) return;
    setSavingTarget(target);
    try {
      const fields = buildFields();
      let id = savedId;
      let status = savedStatus;
      const knownIds = new Set(tickets.persistedIds);
      if (id) {
        // Fields first, status last: the review starts only once the entries
        // it is about are saved.
        const updated = await updateProviderEvent(id, fields);
        status = updated.status;
      } else {
        // Created as a draft and sent to review after its entries exist, so
        // a failure halfway never leaves an event in review without them.
        const created = await createProviderEvent({ ...fields, status: "draft" });
        id = created.id;
        status = created.status;
        setSavedId(created.id);
        setSavedStatus(created.status);
      }
      await syncTickets(id, knownIds);

      // Live events stay live on any save; "published" on one would be kept
      // as is, and a draft save never takes a live event down from here.
      const wantsReview = target === "published" && !isLiveEventStatus(status) && status !== "pending_review";
      const wantsDraft = target === "draft" && status !== "draft" && !isLiveEventStatus(status);
      if (wantsReview || wantsDraft) {
        const updated = await updateProviderEvent(id, { status: target });
        status = updated.status;
        setSavedStatus(updated.status);
      }

      await Promise.all([
        client.invalidateQueries({ queryKey: providerKeys.events }),
        client.invalidateQueries({ queryKey: providerKeys.event(id) }),
        client.invalidateQueries({ queryKey: providerKeys.dashboard }),
      ]);
      toast.success(
        status === "pending_review"
          ? "Tu evento se envió a revisión. Te avisaremos cuando esté publicado."
          : status === "draft"
            ? "Tu evento se guardó como borrador."
            : "Guardamos los cambios de tu evento.",
      );
      router.replace(`/comercio/events/${encodeURIComponent(id)}`);
    } catch (error) {
      const prefix =
        target === "published" && !isLive ? "No se pudo enviar a revisión" : "No se pudo guardar";
      toast.error(`${prefix}. ${eventSaveErrorMessage(error)}`);
      setSavingTarget(null);
    }
  };

  return {
    isEditing: event !== null,
    isLive,

    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    customCategory,
    setCustomCategory,

    coverImageUrl,
    setCoverImageUrl,
    setCoverBusy,

    minDate,
    startDate,
    setStartDate: (value: string) => {
      setStartDate(value);
      // Most events end the day they start; keep the end in step until the
      // comercio picks a different day for it.
      if (!endDate || endDate === startDate || endDate < value) setEndDate(value);
    },
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,

    location,
    venue,
    setVenue,
    address,
    setAddress,
    city,
    setCity,

    tickets,

    capacity,
    setCapacity: (value: string) => setCapacity(digitsOnly(value)),
    capacityFromTickets: tickets.capacityFromTickets,
    hasPaidTickets: tickets.hasPaidTickets,
    refundPolicy,
    setRefundPolicy,
    refundPartialPct,
    setRefundPartialPct: (value: string) => setRefundPartialPct(digitsOnly(value)),
    refundDeadlineDays,
    setRefundDeadlineDays: (value: string) => setRefundDeadlineDays(digitsOnly(value)),
    minAge,
    setMinAge: (value: string) => setMinAge(digitsOnly(value)),
    smokingAllowed,
    setSmokingAllowed,
    petFriendly,
    setPetFriendly,
    parkingAvailable,
    setParkingAvailable,
    kitPickupInfo,
    setKitPickupInfo,

    canSaveDraft: canSaveDraft && missingForDraft.length === 0,
    canSubmit,
    missingForDraft,
    missingForReview,
    savingTarget,
    save: (target: EventSaveTarget) => void save(target),
    cancelHref: event
      ? `/comercio/events/${encodeURIComponent(event.id)}`
      : "/comercio/events",
  };
}
