"use client";

import { useDiscoverClasses } from "@/hooks/useDiscoverClasses";
import { ClassProgramCard } from "@/components/comercios/ClassProgramCard";
import { SectionTitle } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";

/**
 * Recurring classes across comercios, under the events. Hidden when there is
 * nothing to show, so a quiet week does not add a second empty state.
 */
export function DiscoverClassesSection({ search }: { search: string }) {
  const { programs, loading, error, refetch } = useDiscoverClasses(search);

  if (!loading && !error && programs.length === 0) return null;

  return (
    <section className="mt-14">
      <SectionTitle>Clases</SectionTitle>
      {loading ? (
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton
              key={index}
              className="aspect-[4/4.2] w-full rounded-[32px] border border-white/10"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          {programs.map((program, index) => (
            <div
              key={program.id}
              className="rise h-full"
              style={{ "--i": index } as React.CSSProperties}
            >
              <ClassProgramCard
                program={program}
                href={`/clases/${encodeURIComponent(program.id)}`}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
