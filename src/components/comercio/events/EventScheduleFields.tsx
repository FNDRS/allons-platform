import { Card } from "@/components/ui/Card";
import { DateField } from "@/components/ui/DateField";
import { TimePicker } from "@/components/ui/TimePicker";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { useEventForm } from "@/hooks/useEventForm";

type Props = Pick<
  ReturnType<typeof useEventForm>,
  | "minDate"
  | "startDate"
  | "setStartDate"
  | "startTime"
  | "setStartTime"
  | "endDate"
  | "setEndDate"
  | "endTime"
  | "setEndTime"
>;

/** When it starts and ends, in Honduras time. */
export function EventScheduleFields(p: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ClassFormField label="Fecha de inicio">
          {(id) => (
            <DateField id={id} value={p.startDate} min={p.minDate} onChange={p.setStartDate} />
          )}
        </ClassFormField>
        <ClassFormField label="Hora de inicio">
          {(id) => <TimePicker id={id} value={p.startTime} onChange={p.setStartTime} />}
        </ClassFormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ClassFormField label="Fecha de fin">
          {(id) => (
            <DateField
              id={id}
              value={p.endDate}
              min={p.startDate || p.minDate}
              onChange={p.setEndDate}
            />
          )}
        </ClassFormField>
        <ClassFormField label="Hora de fin">
          {(id) => <TimePicker id={id} value={p.endTime} onChange={p.setEndTime} />}
        </ClassFormField>
      </div>
      <p className="text-[12px] leading-5 text-dim">Hora de Honduras.</p>
    </Card>
  );
}
