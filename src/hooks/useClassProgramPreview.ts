"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useProviderClassProgram } from "@/hooks/useProviderClassProgram";
import { comercioKeys, getComercio } from "@/lib/api/comercios";
import { hondurasToday } from "@/lib/classFormat";
import { previewOccurrences } from "@/lib/classPreview";

const PREVIEW_DAYS = 7;

/**
 * A comercio's own class program shaped like the customer page, whatever its
 * status: the program comes from the provider route and the week of sessions
 * from its templates, since the public routes only serve published programs.
 */
export function useClassProgramPreview(id: string) {
  const { program, isLoading, error, refetch } = useProviderClassProgram(id);
  const [from] = useState(() => hondurasToday());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const comercioQuery = useQuery({
    queryKey: comercioKeys.profile(program?.providerId ?? ""),
    queryFn: () => getComercio(program?.providerId as string),
    enabled: Boolean(program?.providerId),
    staleTime: 5 * 60_000,
  });

  const occurrences = useMemo(
    () => (program ? previewOccurrences(program, program.sessionTemplates, from, PREVIEW_DAYS) : []),
    [program, from],
  );
  const days = useMemo(() => [...new Set(occurrences.map((item) => item.date))], [occurrences]);
  const activeDate =
    selectedDate && days.includes(selectedDate) ? selectedDate : (days[0] ?? null);
  const dayOccurrences = useMemo(
    () => occurrences.filter((item) => item.date === activeDate),
    [occurrences, activeDate],
  );
  const packages = useMemo(
    () =>
      (program?.packages ?? [])
        .filter((item) => item.active)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [program?.packages],
  );

  return {
    program,
    packages,
    comercio: comercioQuery.data ?? null,
    isLoading,
    error,
    refetch,
    days,
    activeDate,
    selectDate: setSelectedDate,
    dayOccurrences,
  };
}
