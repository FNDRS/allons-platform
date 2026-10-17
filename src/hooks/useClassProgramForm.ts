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
  type ClassProgramStatus,
  type ProviderClassProgram,
} from "@/lib/api/providerClassPrograms";
import { classProgramErrorMessage } from "@/hooks/useProviderClassPrograms";
import { catalogCoversProgram, useClassCatalog } from "@/hooks/useClassCatalog";
import { useClassCoaches } from "@/hooks/useClassCoaches";
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
  const [coachId, setCoachId] = useState(program?.coachId ?? "");
  // Free-text instructor from before coaches existed, kept until a coach is picked.
  const [legacyInstructor, setLegacyInstructor] = useState(
    program && !program.coachId ? (program.instructorName ?? null) : null,
  );
  const { coaches } = useClassCoaches();
  const catalog = useClassCatalog();
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
  const [savingTarget, setSavingTarget] = useState<ClassProgramStatus | null>(null);

  const schedule = useClassSessionTemplatesForm(
    program?.sessionTemplates.filter((template) => template.active),
  );
  const packages = useClassPackagesForm(program?.packages.filter((item) => item.active));
  const catalogPackageCount = catalog.items.filter((item) =>
    catalogCoversProgram(item, program?.id ?? null),
  ).length;

  // A pin set from the app decides the city on the API, so the web keeps it
  // as is instead of offering fields that the pin would silently override.
  const pinned = program?.latitude != null && program?.longitude != null;

  const isSaving = savingTarget !== null;
  // Edits to a published program keep it public; anything else goes to review.
  const isPublished = program?.status === "published";
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
    !packages.hasPackages && catalogPackageCount === 0 ? "un paquete" : null,
  ].filter((item): item is string => item !== null);
  const canPublish = canSaveDraft && missingForPublish.length === 0;

  const save = async (status: ClassProgramStatus) => {
    if (status === "published" ? !canPublish : !canSaveDraft) return;
    setSavingTarget(status);
    try {
      const fields = {
        title: title.trim(),
        description: description.trim() || null,
        coachId: coachId || null,
        // A coach names the program on the server; without one the old free
        // text stays, or clears once the comercio picked "Sin coach".
        ...(coachId ? {} : { instructorName: legacyInstructor }),
        durationMinutes: Number(durationMinutes),
        capacityPerSession: Number(capacityPerSession),
        locationName: locationName.trim() || null,
        coverImageUrl,
        ...(pinned ? {} : { address: address.trim() || null, city: city.trim() || null }),
      };

      let saved: ProviderClassProgram;
      if (program) {
        // There is no bulk endpoint, so children go one request each, and
        // before the program itself: a failure among them must not leave a
        // program freshly published with half-updated schedules or packages.
        // Each write that lands is recorded at once, so a retry patches it.
        // Every write settles before Save comes back, so a quick retry never
        // races a create still in flight and duplicates it.
        const scheduleDiff = schedule.toDiff();
        const packageDiff = packages.toDiff();
        const results = await Promise.allSettled([
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
        const failed = results.find(
          (result): result is PromiseRejectedResult => result.status === "rejected",
        );
        if (failed) throw failed.reason;
        saved = await updateProviderClassProgram(program.id, { ...fields, status });
      } else {
        // One request, one transaction on the API: nothing is left behind
        // if it fails, and the program is created with its final status.
        saved = await createProviderClassProgram({
          ...fields,
          status,
          sessionTemplates: schedule.toPayloads(),
          packages: packages.toPayloads(),
        });
      }

      await client.invalidateQueries({ queryKey: providerClassProgramKeys.all });
      // The API decides the stored status: a first submission waits for
      // review, an edit to a published program stays published.
      toast.success(
        saved.status === "pending_review"
          ? "Tu programa se envió a revisión. Te avisaremos cuando esté publicado."
          : saved.status === "draft"
            ? "Tu programa se guardó como borrador."
            : "Guardamos los cambios de tu programa.",
      );
      router.replace(`/comercio/clases/${encodeURIComponent(saved.id)}`);
    } catch (error) {
      const prefix =
        status === "published" && !isPublished
          ? "No se pudo enviar a revisión"
          : "No se pudo guardar";
      toast.error(`${prefix}. ${classProgramErrorMessage(error)}`);
      setSavingTarget(null);
    }
  };

  return {
    isEditing: program !== null,
    isPublished,
    title,
    setTitle,
    description,
    setDescription,
    coaches,
    coachId,
    legacyInstructor,
    setCoachId: (value: string) => {
      setCoachId(value);
      setLegacyInstructor(null);
    },
    catalogPackageCount,
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
