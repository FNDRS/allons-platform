import { ClassBuilderSection } from "@/components/comercio/classes/ClassBuilderSection";
import { ClassDraftRow } from "@/components/comercio/classes/ClassDraftRow";
import {
  sessionTimes,
  ticketPrice,
  ticketStartsAt,
  type EventTicketDraft,
} from "@/hooks/event-form/useEventTicketsForm";
import { isoToHn } from "@/hooks/event-form/time";
import { formatHNL } from "@/lib/format";
import { formatSaleMoment, saleWindowLabel } from "./ticketSaleWindow";

function details(draft: EventTicketDraft): string {
  const parts = [`${Number(draft.total) || 0} a la venta`];
  if (draft.sold > 0) parts.push(`${draft.sold} vendidas`);
  if (ticketPrice(draft) > 0 && draft.donationEnabled) parts.push("acepta donaciones");
  return parts.join(" · ");
}

/** A session's own day and place, for a bundle event's list. */
function sessionLabel(draft: EventTicketDraft): string | null {
  const start = isoToHn(sessionTimes(draft).startsAt);
  const parts = [
    start.date && start.time ? formatSaleMoment(start.date, start.time) : null,
    draft.venue.trim() || null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** The event's ticket types (entradas), each opened in a modal to edit. */
export function EventTicketsBuilder({
  tickets,
  eventStartsAt,
  bundle = false,
  onAdd,
  onEdit,
  onRemove,
}: {
  tickets: EventTicketDraft[];
  eventStartsAt: string | null;
  /** A bundle event: each entry is a session with its own day and place. */
  bundle?: boolean;
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
            detail={
              bundle
                ? [sessionLabel(draft), details(draft)].filter(Boolean).join(" · ")
                : details(draft)
            }
            meta={saleWindowLabel(draft, ticketStartsAt(draft, eventStartsAt, bundle))}
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
