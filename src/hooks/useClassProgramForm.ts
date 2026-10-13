"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createClassPackage,
  createClassSessionTemplate,
  createProviderClassProgram,
  deleteClassPackage,
  deleteClassSessionTemplate,
  providerClassProgramKeys,
  updateClassPackage,
  updateClassSessionTemplate,
  updateProviderClassProgram,
  type ClassCancellationPolicy,
  type ClassProgramStatus,
  type ProviderClassProgram,
} from "@/lib/api/providerClassPrograms";
import { classProgramErrorMessage } from "@/hooks/useProviderClassPrograms";
import {
  DEFAULT_CANCELLATION_HOURS,
  MAX_CANCELLATION_HOURS,
} from "./class-program-form/constants";
import { useClassPackagesForm } from "./class-program-form/useClassPackagesForm";
import { useClassSessionTemplatesForm } from "./class-program-form/useClassSessionTemplatesForm";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

/**
 * Create or edit a class program with its schedules and packages. `program`
 * seeds the fields once, so mount the form only after it has loaded.
 */
export function useClassProgramForm(program: ProviderClassProgram | null) {
  const client = useQueryClient();
  const router = useRouter();

  const [title, setTitle] = useState(program?.title ?? "");
  const [description, setDescription] = useState(program?.description ?? "");
  const [instructorName, setInstructorName] = useState(program?.instructorName ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    program ? String(program.durationMinutes) : "60",
  );
  const [capacityPerSession, setCapacityPerSession] = useState(
    program ? String(program.capacityPerSession) : "12",
  );
  const [locationName, setLocationName] = useState(program?.locationName ?? "");
  const [address, setAddress] = useState(program?.address ?? "");
  const [city, setCity] = useState(program?.city ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    program?.coverImageUrl ?? null,
  );
  const [coverBusy, setCoverBusy] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState<ClassCancellationPolicy>(
    program?.cancellationPolicy ?? "credit",
  );
  const [cancellationWindowHours, setCancellationWindowHours] = useState(
    String(program?.cancellationWindowHours ?? DEFAULT_CANCELLATION_HOURS),
  );
  const [savingTarget, setSavingTarget] = useState<ClassProgramStatus | null>(null);

  const schedule = useClassSessionTemplatesForm(
    program?.sessionTemplates.filter((template) => template.active),
  );
  const packages = useClassPackagesForm(program?.packages.filter((item) => item.active));

  // A pin set from the app decides the city on the API, so the web keeps it
  // as is instead of offering fields that the pin would silently override.
  const pinned = program?.latitude != null && program?.longitude != null;

  const isSaving = savingTarget !== null;
  const canSaveDraft =
    title.trim().length > 0 &&
    Number(durationMinutes) > 0 &&
    Number(capacityPerSession) > 0 &&
    !coverBusy &&
    !isSaving;
  const missingForPublish = [
    !pinned && !address.trim() ? "la dirección" : null,
    !pinned && !city.trim() ? "la ciudad" : null,
    !schedule.hasSchedules ? "un horario" : null,
    !packages.hasPackages ? "un paquete" : null,
  ].filter((item): item is string => item !== null);
  const canPublish = canSaveDraft && missingForPublish.length === 0;

  const save = async (status: ClassProgramStatus) => {
    if (status === "published" ? !canPublish : !canSaveDraft) return;
    setSavingTarget(status);
    try {
      const fields = {
        title: title.trim(),
        description: description.trim() || null,
        instructorName: instructorName.trim() || null,
        durationMinutes: Number(durationMinutes),
        capacityPerSession: Number(capacityPerSession),
        locationName: locationName.trim() || null,
        coverImageUrl,
        cancellationPolicy,
        // An emptied field asks for the default back, not a zero-hour window.
        cancellationWindowHours:
          cancellationWindowHours.trim() === ""
            ? DEFAULT_CANCELLATION_HOURS
            : Number(cancellationWindowHours),
        ...(pinned ? {} : { address: address.trim() || null, city: city.trim() || null }),
      };

      let savedId: string;
      if (program) {
        // There is no bulk endpoint, so children go one request each, and
        // before the program itself: a failure among them must not leave a
        // program freshly published with half-updated schedules or packages.
        // Each write that lands is recorded at once, so a retry patches it.
        const scheduleDiff = schedule.toDiff();
        const packageDiff = packages.toDiff();
        await Promise.all([
          ...scheduleDiff.create.map(({ draftId, payload }) =>
            createClassSessionTemplate(program.id, payload).then((created) =>
              schedule.markPersisted(draftId, created.id),
            ),
          ),
          ...scheduleDiff.update.map(({ id, payload }) => updateClassSessionTemplate(id, payload)),
          ...scheduleDiff.removeIds.map((id) =>
            deleteClassSessionTemplate(id).then(() => schedule.markDeleted(id)),
          ),
          ...packageDiff.create.map(({ draftId, payload }) =>
            createClassPackage(program.id, payload).then((created) =>
              packages.markPersisted(draftId, created.id),
            ),
          ),
          ...packageDiff.update.map(({ id, payload }) => updateClassPackage(id, payload)),
          ...packageDiff.removeIds.map((id) =>
            deleteClassPackage(id).then(() => packages.markDeleted(id)),
          ),
        ]);
        await updateProviderClassProgram(program.id, { ...fields, status });
        savedId = program.id;
      } else {
        // One request, one transaction on the API: nothing is left behind
        // if it fails, and the program is created with its final status.
        const created = await createProviderClassProgram({
          ...fields,
          status,
          sessionTemplates: schedule.toPayloads(),
          packages: packages.toPayloads(),
        });
        savedId = created.id;
      }

      await client.invalidateQueries({ queryKey: providerClassProgramKeys.all });
      toast.success(
        program
          ? "Guardamos los cambios de tu programa."
          : status === "published"
            ? "Tu programa se creó y quedó publicado."
            : "Tu programa se guardó como borrador.",
      );
      router.replace(`/comercio/clases/${encodeURIComponent(savedId)}`);
    } catch (error) {
      const prefix = status === "published" ? "No se pudo publicar" : "No se pudo guardar";
      toast.error(`${prefix}. ${classProgramErrorMessage(error)}`);
      setSavingTarget(null);
    }
  };

  return {
    isEditing: program !== null,
    title,
    setTitle,
    description,
    setDescription,
    instructorName,
    setInstructorName,
    durationMinutes,
    setDurationMinutes: (value: string) => setDurationMinutes(digitsOnly(value)),
    capacityPerSession,
    setCapacityPerSession: (value: string) => setCapacityPerSession(digitsOnly(value)),

    pinned,
    locationName,
    setLocationName,
    address,
    setAddress,
    city,
    setCity,

    coverImageUrl,
    setCoverImageUrl,
    setCoverBusy,

    cancellationPolicy,
    setCancellationPolicy,
    cancellationWindowHours,
    // Clamped here: the API has a CHECK for the same bound, and a refused
    // save after filling the whole form is a worse way to learn about it.
    setCancellationWindowHours: (value: string) => {
      const digits = digitsOnly(value);
      setCancellationWindowHours(
        digits === "" ? "" : String(Math.min(Number(digits), MAX_CANCELLATION_HOURS)),
      );
    },

    schedule,
    packages,

    canSaveDraft,
    canPublish,
    missingForPublish,
    savingTarget,
    save: (status: ClassProgramStatus) => void save(status),
    cancelHref: program
      ? `/comercio/clases/${encodeURIComponent(program.id)}`
      : "/comercio/clases",
  };
}
