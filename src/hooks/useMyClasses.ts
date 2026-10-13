"use client";

import { useQuery } from "@tanstack/react-query";
import {
  balanceHasSessions,
  listMyClassPasses,
  listMyUpcomingClassReservations,
  myClassKeys,
} from "@/lib/api/classPrograms";

/** The buyer's usable class passes and upcoming bookings, for Mis tickets. */
export function useMyClasses(enabled: boolean) {
  const passes = useQuery({
    queryKey: myClassKeys.passes,
    queryFn: listMyClassPasses,
    enabled,
  });
  const reservations = useQuery({
    queryKey: myClassKeys.upcoming,
    queryFn: listMyUpcomingClassReservations,
    enabled,
  });

  return {
    passes: (passes.data ?? []).filter(balanceHasSessions),
    reservations: (reservations.data ?? []).filter((item) => item.status !== "cancelled"),
    loading: passes.isLoading || reservations.isLoading,
    error: ((passes.error ?? reservations.error) as Error | null) ?? null,
    refetch: () => {
      void passes.refetch();
      void reservations.refetch();
    },
  };
}
