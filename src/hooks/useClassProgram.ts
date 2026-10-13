"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/app/AuthProvider";
import {
  balanceHasSessions,
  classProgramKeys,
  getClassProgram,
  listClassAvailability,
} from "@/lib/api/classPrograms";
import { comercioKeys, getComercio } from "@/lib/api/comercios";
import { hondurasToday } from "@/lib/classFormat";

const AVAILABILITY_DAYS = 7;

/**
 * One class program as a customer sees it: the program (with the buyer's
 * balance when signed in), its comercio, and the next week of sessions
 * grouped by day. Waits for the session read so a signed-in buyer is not
 * served the guest answer first.
 */
export function useClassProgram(programId: string) {
  const { user, loading: authLoading } = useAuth();
  const viewer = user?.id ?? null;
  const authenticated = Boolean(user);
  const [from] = useState(() => hondurasToday());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const programQuery = useQuery({
    queryKey: classProgramKeys.detail(programId, viewer),
    queryFn: () => getClassProgram(programId, authenticated),
    enabled: !authLoading && Boolean(programId),
  });
  const program = programQuery.data ?? null;

  const availabilityQuery = useQuery({
    queryKey: classProgramKeys.availability(programId, from, AVAILABILITY_DAYS, viewer),
    queryFn: () =>
      listClassAvailability(programId, { from, days: AVAILABILITY_DAYS, authenticated }),
    enabled: !authLoading && Boolean(programId),
  });

  const comercioQuery = useQuery({
    queryKey: comercioKeys.profile(program?.providerId ?? ""),
    queryFn: () => getComercio(program?.providerId as string),
    enabled: Boolean(program?.providerId),
    staleTime: 5 * 60_000,
  });

  const occurrences = useMemo(() => availabilityQuery.data ?? [], [availabilityQuery.data]);
  const days = useMemo(
    () => [...new Set(occurrences.map((item) => item.date))],
    [occurrences],
  );
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

  const balance = program?.myBalance ?? null;

  return {
    program,
    packages,
    comercio: comercioQuery.data ?? null,
    balance,
    hasSessions: balanceHasSessions(balance),
    signedIn: authenticated,
    loading: authLoading || programQuery.isLoading,
    error: (programQuery.error as Error | null) ?? null,
    refetch: () => {
      void programQuery.refetch();
      void availabilityQuery.refetch();
    },
    days,
    activeDate,
    selectDate: setSelectedDate,
    dayOccurrences,
    availabilityLoading: authLoading || availabilityQuery.isLoading,
    availabilityError: (availabilityQuery.error as Error | null) ?? null,
    refetchAvailability: () => void availabilityQuery.refetch(),
  };
}

export type ClassProgramState = ReturnType<typeof useClassProgram>;
