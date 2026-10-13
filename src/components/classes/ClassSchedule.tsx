import type { ClassOccurrence } from "@/lib/api/classPrograms";
import { formatClassDayChip } from "@/lib/classFormat";
import { SectionTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Pill";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { ClassOccurrenceRow } from "./ClassOccurrenceRow";

/** The next week of sessions, one day at a time. */
export function ClassSchedule({
  days,
  activeDate,
  onSelectDate,
  occurrences,
  loading,
  error,
  onRetry,
  signedIn,
  hasSessions,
  reservingKey,
  onReserve,
}: {
  days: string[];
  activeDate: string | null;
  onSelectDate: (date: string) => void;
  occurrences: ClassOccurrence[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  signedIn: boolean;
  hasSessions: boolean;
  /** `date|startTime` of the slot being booked. */
  reservingKey: string | null;
  onReserve: (occurrence: ClassOccurrence) => void;
}) {
  return (
    <section id="agenda" className="scroll-mt-24">
      <SectionTitle>Próximas sesiones</SectionTitle>
      {signedIn && !hasSessions && !loading && !error ? (
        <p className="mb-3 text-[13px] text-white/50">
          Compra un paquete para reservar horarios de esta clase.
        </p>
      ) : null}
      {loading ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : days.length === 0 ? (
        <EmptyState
          title="Sin sesiones esta semana"
          body="Cuando el comercio abra nuevos horarios los verás aquí."
        />
      ) : (
        <>
          <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
            {days.map((day) => (
              <Chip key={day} active={day === activeDate} onClick={() => onSelectDate(day)}>
                {formatClassDayChip(day)}
              </Chip>
            ))}
          </div>
          <ul className="flex flex-col gap-2.5">
            {occurrences.map((occurrence) => {
              const key = `${occurrence.date}|${occurrence.startTime}`;
              return (
                <ClassOccurrenceRow
                  key={key}
                  occurrence={occurrence}
                  signedIn={signedIn}
                  hasSessions={hasSessions}
                  reserving={reservingKey === key}
                  onReserve={() => onReserve(occurrence)}
                />
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
