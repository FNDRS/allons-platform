import type { ClassOccurrence, ClassSessionTemplate } from "@/lib/api/classPrograms";

/**
 * The sessions a program would offer from `from` over `days`, built from its
 * active templates. Used where the API's availability is not an option: it
 * only answers for published programs. Nobody has booked a preview, so every
 * slot shows its full capacity.
 */
export function previewOccurrences(
  program: { durationMinutes: number; capacityPerSession: number; instructorName: string | null },
  templates: ClassSessionTemplate[],
  from: string,
  days: number,
): ClassOccurrence[] {
  const [y, m, d] = from.split("-").map(Number);
  const active = templates.filter((template) => template.active);
  const out: ClassOccurrence[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(Date.UTC(y, m - 1, d + offset, 12));
    const date = day.toISOString().slice(0, 10);
    active
      .filter((template) => template.weekday === day.getUTCDay())
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .forEach((template) => {
        const capacity = template.capacity ?? program.capacityPerSession;
        out.push({
          date,
          label: "",
          startTime: template.startTime,
          durationMinutes: template.durationMinutes ?? program.durationMinutes,
          instructorName: template.instructorName ?? program.instructorName,
          capacity,
          reservedCount: 0,
          availableSpots: capacity,
          canReserve: true,
        });
      });
  }
  return out;
}
