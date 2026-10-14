import { Card, SectionTitle } from "@/components/ui/Card";
import type { ClassSessionTemplate } from "@/lib/api/providerClassPrograms";
import { slotLabel, slotRangeLabel } from "./classProgramFormat";

/** The program's active weekly slots, read only. */
export function ClassProgramScheduleSummary({ templates }: { templates: ClassSessionTemplate[] }) {
  const active = templates
    .filter((template) => template.active)
    .sort((a, b) => ((a.weekday + 6) % 7) - ((b.weekday + 6) % 7) || a.startTime.localeCompare(b.startTime));
  return (
    <section>
      <SectionTitle>{`Horarios · ${active.length}`}</SectionTitle>
      {active.length === 0 ? (
        <p className="text-[13px] text-white/50">Este programa no tiene horarios.</p>
      ) : (
        <Card padding="none" className="divide-y divide-border">
          {active.map((template) => {
            const range = slotRangeLabel(template.startsOn, template.endsOn);
            return (
              <div key={template.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">{slotLabel(template.weekday, template.startTime)}</p>
                  {range ? <p className="text-[12px] font-semibold text-accent">{range}</p> : null}
                </div>
                <p className="truncate text-[13px] text-white/50">
                  {[
                    template.instructorName,
                    template.capacity ? `${template.capacity} cupos` : null,
                    template.durationMinutes ? `${template.durationMinutes} min` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            );
          })}
        </Card>
      )}
    </section>
  );
}
