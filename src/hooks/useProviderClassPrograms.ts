"use client";

import { useQuery } from "@tanstack/react-query";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { isApiError } from "@/lib/api/client";
import {
  listProviderClassPrograms,
  providerClassProgramKeys,
  type ProviderClassProgram,
} from "@/lib/api/providerClassPrograms";

/** What a member without the events permission sees instead of the API wording. */
export const CLASSES_FORBIDDEN_MESSAGE =
  "Tu rol no permite administrar clases. Pide acceso a quien administra el comercio.";

/** Readable message for a failed class-program request. */
export function classProgramErrorMessage(error: unknown): string {
  if (isApiError(error) && error.status === 403) return CLASSES_FORBIDDEN_MESSAGE;
  return error instanceof Error ? error.message : "No pudimos cargar tus clases.";
}

/** The comercio's class programs, newest first, with a published count. */
export function useProviderClassPrograms() {
  const { ready } = useProviderAccess();
  const query = useQuery({
    queryKey: providerClassProgramKeys.all,
    queryFn: listProviderClassPrograms,
    enabled: ready,
  });
  const programs: ProviderClassProgram[] = [...(query.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return {
    programs,
    publishedCount: programs.filter((program) => program.status === "published").length,
    isLoading: !ready || query.isLoading,
    error: query.error ? classProgramErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
  };
}
