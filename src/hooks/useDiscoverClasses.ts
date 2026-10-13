"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { classProgramKeys, listDiscoveryClassPrograms } from "@/lib/api/classPrograms";

/** Published class programs across comercios, filtered by the listing's search. */
export function useDiscoverClasses(search: string) {
  const query = useQuery({
    queryKey: classProgramKeys.discover,
    queryFn: () => listDiscoveryClassPrograms(),
  });

  const programs = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (query.data ?? []).filter((program) => {
      if (!needle) return true;
      return [program.title, program.discipline, program.city, program.provider?.name]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(needle));
    });
  }, [query.data, search]);

  return {
    programs,
    loading: query.isLoading,
    error: (query.error as Error | null) ?? null,
    refetch: () => void query.refetch(),
  };
}
