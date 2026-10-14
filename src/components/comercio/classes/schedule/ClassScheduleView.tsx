"use client";

import { Card, SectionTitle } from "@/components/ui/Card";
import { Select, SelectItem } from "@/components/ui/Select";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useClassCoaches } from "@/hooks/useClassCoaches";
import { NO_COACH_FILTER, useClassSchedule } from "@/hooks/useClassSchedule";
import { formatClassDate } from "@/lib/classFormat";
import { todayHN } from "@/lib/dateKeys";
import { ClassScheduleSessionRow } from "./ClassScheduleSessionRow";
import { ClassWeekNav } from "./ClassWeekNav";

/** The week's classes day by day, with who teaches each one. */
export function ClassScheduleView() {
  const s = useClassSchedule();
  const { coaches } = useClassCoaches();
  const today = todayHN();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ClassWeekNav
          weekStart={s.weekStart}
          weekEnd={s.weekEnd}
          isCurrentWeek={s.isCurrentWeek}
          onPrevious={s.previousWeek}
          onNext={s.nextWeek}
          onToday={s.thisWeek}
          onJump={s.jumpTo}
        />
        <div className="w-full lg:w-[240px]">
          <Select value={s.coachFilter} onValueChange={s.setCoachFilter} aria-label="Filtrar por coach">
            <SelectItem value="">Todos los coaches</SelectItem>
            <SelectItem value={NO_COACH_FILTER}>Sin coach</SelectItem>
            {coaches.map((coach) => (
              <SelectItem key={coach.id} value={coach.id}>
                {coach.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <p className="text-[13px] text-white/50">
        Cambiar el coach de una clase lo cambia en ese horario para todas las semanas, no solo en esta.
      </p>

      {s.isLoading ? (
        <Skeleton className="h-[420px] w-full rounded-[24px]" />
      ) : s.error ? (
        <ErrorState message={s.error} onRetry={s.refetch} />
      ) : s.total === 0 ? (
        <EmptyState
          title={s.coachFilter ? "Ninguna clase con ese filtro" : "No hay clases esta semana"}
          body={s.coachFilter ? "Prueba con otro coach o quita el filtro." : "Los horarios se agregan en cada programa."}
        />
      ) : (
        s.days
          .filter((day) => day.sessions.length > 0)
          .map((day) => (
            <section key={day.date}>
              <SectionTitle>
                {`${formatClassDate(day.date)}${day.date === today ? " · Hoy" : ""}`}
              </SectionTitle>
              <Card padding="none" className="divide-y divide-border">
                {day.sessions.map((session) => (
                  <ClassScheduleSessionRow
                    key={`${session.templateId}-${session.date}`}
                    session={session}
                    coaches={coaches}
                    swapping={s.swappingTemplateId === session.templateId}
                    onSwapCoach={(coachId) => s.swapCoach(session, coachId)}
                  />
                ))}
              </Card>
            </section>
          ))
      )}
    </div>
  );
}
