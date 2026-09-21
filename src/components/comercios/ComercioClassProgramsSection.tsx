import type { ClassProgramPublic } from "@/lib/api/comercios";
import { SectionTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { ClassProgramCard } from "./ClassProgramCard";

/** Published recurring classes. Rendered only when the comercio has any. */
export function ComercioClassProgramsSection({
  programs,
  loading,
  appDeepLink,
}: {
  programs: ClassProgramPublic[];
  loading: boolean;
  appDeepLink: string;
}) {
  if (!loading && programs.length === 0) return null;
  return (
    <section>
      <SectionTitle>Clases</SectionTitle>
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-[28px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {programs.map((program, index) => (
            <div
              key={program.id}
              className="rise h-full"
              style={{ "--i": index } as React.CSSProperties}
            >
              <ClassProgramCard program={program} appDeepLink={appDeepLink} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
