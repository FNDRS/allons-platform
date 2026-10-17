import { ClassBuilderSection } from "@/components/comercio/classes/ClassBuilderSection";
import { ClassDraftRow } from "@/components/comercio/classes/ClassDraftRow";
import { ticketPrice, type EventTicketDraft } from "@/hooks/event-form/useEventTicketsForm";
import { formatHNL } from "@/lib/format";
import { formatTime12 } from "@/components/ui/TimePicker";

const dayFmt = new Intl.DateTimeFormat("es-HN", { day: "numeric", month: "short" });
const day = (key: string) => dayFmt.format(new Date(`${key}T12:00:00`));

function details(draft: EventTicketDraft): string {
  const parts = [`${Number(draft.total) || 0} a la venta`];
  if (draft.sold > 0) parts.push(`${draft.sold} vendidas`);
  if (ticketPrice(draft) > 0 && draft.saleStartDate && draft.saleEndDate) {
    parts.push(
      `venta del ${day(draft.saleStartDate)} ${formatTime12(draft.saleStartTime)} al ${day(draft.saleEndDate)} ${formatTime12(draft.saleEndTime)}`,
    );
  }
  return parts.join(" · ");
}

/** The event's ticket types (entradas), each opened in a modal to edit. */
export function EventTicketsBuilder({
  tickets,
  onAdd,
  onEdit,
  onRemove,
}: {
  tickets: EventTicketDraft[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <ClassBuilderSection
      title="Entradas"
      intro="Los tipos de entrada que vendes o regalas: general, VIP, preventa. Las que ya tienen ventas no se pueden quitar."
      addLabel="Agregar entrada"
      emptyHint="Agrega al menos una entrada para enviar el evento a revisión."
      isEmpty={tickets.length === 0}
      onAdd={onAdd}
    >
      {tickets.map((draft) => {
        const name = draft.name || "Entrada";
        const price = ticketPrice(draft);
        return (
          <ClassDraftRow
            key={draft.id}
            title={name}
            detail={details(draft)}
            aside={price > 0 ? formatHNL(price) : "Gratis"}
            editLabel={`Editar ${name}`}
            removeLabel={`Quitar ${name}`}
            canRemove={draft.sold === 0}
            onEdit={() => onEdit(draft.id)}
            onRemove={() => onRemove(draft.id)}
          />
        );
      })}
    </ClassBuilderSection>
  );
}
