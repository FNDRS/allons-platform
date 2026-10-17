import { DateField } from "@/components/ui/DateField";
import { Label } from "@/components/ui/Field";
import { TimePicker } from "@/components/ui/TimePicker";
import { saleEnd, type EventTicketDraft } from "@/hooks/event-form/useEventTicketsForm";
import { todayHN } from "@/lib/dateKeys";
import { eventStartLabel } from "./ticketSaleWindow";

/** A date and a time side by side under one label. */
function MomentRow({
  label,
  date,
  time,
  min,
  datePlaceholder,
  onDate,
  onTime,
}: {
  label: string;
  date: string;
  time: string;
  min: string;
  datePlaceholder?: string;
  onDate: (date: string) => void;
  onTime: (time: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <Label>{label}</Label>
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-2">
        <DateField
          value={date}
          min={min}
          onChange={onDate}
          placeholder={datePlaceholder}
        />
        <TimePicker value={time} onChange={onTime} />
      </div>
    </div>
  );
}

/**
 * When a paid entry sells. Both ends come filled in: from now until the event
 * starts. The end follows the event's start until the comercio sets its own.
 */
export function EventTicketSaleWindowFields({
  draft,
  eventStartsAt,
  onChange,
}: {
  draft: EventTicketDraft;
  eventStartsAt: string | null;
  onChange: (patch: Partial<EventTicketDraft>) => void;
}) {
  const today = todayHN();
  const end = saleEnd(draft, eventStartsAt);
  const eventStart = eventStartLabel(eventStartsAt);
  const startMin = draft.saleStartDate && draft.saleStartDate < today ? draft.saleStartDate : today;
  const endBase = draft.saleStartDate || startMin;
  const endMin = end.date && end.date < endBase ? end.date : endBase;

  // Touching the end pins it: from here on it no longer moves with the event.
  const setEnd = (patch: { date?: string; time?: string }) =>
    onChange({
      saleEndFollowsEvent: false,
      saleEndDate: patch.date ?? end.date,
      saleEndTime: patch.time ?? end.time,
    });

  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-border bg-surface p-4">
      <div>
        <p className="text-[14px] font-semibold tracking-tight">Cuándo se vende</p>
        <p className="text-[12px] leading-5 text-dim">
          La venta tiene que terminar a más tardar el día del evento.
        </p>
      </div>
      <MomentRow
        label="Venta desde"
        date={draft.saleStartDate}
        time={draft.saleStartTime}
        min={startMin}
        onDate={(saleStartDate) => onChange({ saleStartDate })}
        onTime={(saleStartTime) => onChange({ saleStartTime })}
      />
      <div className="flex flex-col gap-1.5">
        <MomentRow
          label="Venta hasta"
          date={end.date}
          time={end.time}
          min={endMin}
          datePlaceholder="Cuando empiece el evento"
          onDate={(date) => setEnd({ date })}
          onTime={(time) => setEnd({ time })}
        />
        {draft.saleEndFollowsEvent ? (
          <p className="text-[12px] leading-5 text-dim">
            {eventStart
              ? `Termina cuando empieza el evento (${eventStart}). Si cambias la fecha del evento, se mueve con ella.`
              : "Termina cuando empieza el evento. Pon la fecha del evento para verla aquí."}
          </p>
        ) : (
          <button
            type="button"
            onClick={() =>
              onChange({ saleEndFollowsEvent: true, saleEndDate: "", saleEndTime: "" })
            }
            className="w-fit text-[12px] font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Que termine cuando empiece el evento
          </button>
        )}
      </div>
    </div>
  );
}
