"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { classProgramErrorMessage } from "@/hooks/useProviderClassPrograms";
import { classCoachKeys } from "@/lib/api/classCoaches";
import {
  classScheduleKeys,
  getClassSchedule,
  type ClassScheduleSession,
} from "@/lib/api/classSchedule";
import {
  providerClassProgramKeys,
  updateClassSessionTemplate,
} from "@/lib/api/providerClassPrograms";
import { addDays, mondayOf, todayHN } from "@/lib/dateKeys";

const WEEK_DAYS = 7;

/** Filter value for sessions without a coach. */
export const NO_COACH_FILTER = "__none__";

export type ScheduleDay = { date: string; sessions: ClassScheduleSession[] };

/** The comercio's timetable one week at a time, with coach swaps per slot. */
export function useClassSchedule() {
  const { ready } = useProviderAccess();
  const client = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayHN()));
  const [coachFilter, setCoachFilter] = useState("");

  const query = useQuery({
    queryKey: classScheduleKeys.range(weekStart, WEEK_DAYS),
    queryFn: () => getClassSchedule(weekStart, WEEK_DAYS),
    enabled: ready,
  });

  const swapCoach = useMutation({
    mutationFn: ({ session, coachId }: { session: ClassScheduleSession; coachId: string }) =>
      updateClassSessionTemplate(session.templateId, { coachId: coachId || null }),
    onSuccess: () => {
      toast.success("Cambiamos el coach de ese horario en todas las semanas.");
      return Promise.all([
        client.invalidateQueries({ queryKey: classScheduleKeys.all }),
        client.invalidateQueries({ queryKey: providerClassProgramKeys.all }),
        client.invalidateQueries({ queryKey: classCoachKeys.all }),
      ]);
    },
    onError: (error) => toast.error(classProgramErrorMessage(error)),
  });

  const matches = (session: ClassScheduleSession) =>
    !coachFilter ||
    (coachFilter === NO_COACH_FILTER ? !session.coachId : session.coachId === coachFilter);

  const sessions = query.data?.sessions ?? [];
  const days: ScheduleDay[] = Array.from({ length: WEEK_DAYS }, (_, index) => {
    const date = addDays(weekStart, index);
    return {
      date,
      sessions: sessions
        .filter((session) => session.date === date && matches(session))
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  });

  return {
    weekStart,
    weekEnd: addDays(weekStart, WEEK_DAYS - 1),
    isCurrentWeek: weekStart === mondayOf(todayHN()),
    previousWeek: () => setWeekStart((current) => addDays(current, -WEEK_DAYS)),
    nextWeek: () => setWeekStart((current) => addDays(current, WEEK_DAYS)),
    thisWeek: () => setWeekStart(mondayOf(todayHN())),
    jumpTo: (date: string) => setWeekStart(mondayOf(date)),
    coachFilter,
    setCoachFilter,
    days,
    total: days.reduce((sum, day) => sum + day.sessions.length, 0),
    isLoading: !ready || query.isLoading,
    error: query.error ? classProgramErrorMessage(query.error) : null,
    refetch: () => void query.refetch(),
    swapCoach: (session: ClassScheduleSession, coachId: string) =>
      swapCoach.mutate({ session, coachId }),
    swappingTemplateId: swapCoach.isPending ? swapCoach.variables?.session.templateId ?? null : null,
  };
}
