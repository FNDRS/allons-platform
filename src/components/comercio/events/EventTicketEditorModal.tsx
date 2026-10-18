import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import {
  ticketPrice,
  ticketStartsAt,
  type EventTicketDraft,
} from "@/hooks/event-form/useEventTicketsForm";
import { EventTicketDonationFields } from "./EventTicketDonationFields";
import { EventTicketSaleWindowFields } from "./EventTicketSaleWindowFields";
import { EventTicketSessionFields } from "./EventTicketSessionFields";

const digits = (value: string) => value.replace(/\D/g, "");

/**
 * Authors one ticket type: name, price, how many, when it sells, donations.
 * In a bundle event it is also a session, with its own date and place.
 */
export function EventTicketEditorModal({
  draft,
  eventStartsAt,
  bundle = false,
  error,
  onChange,
  onCancel,
  onConfirm,
}: {
  draft: EventTicketDraft | null;
  eventStartsAt: string | null;
  /** A bundle event: the editor also takes the session's fields. */
  bundle?: boolean;
  error: string | null;
  onChange: (patch: Partial<EventTicketDraft>) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const paid = draft ? ticketPrice(draft) > 0 : false;
  return (
    <Modal
      open={Boolean(draft)}
      onClose={onCancel}
      title="Entrada"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" disabled={Boolean(error)} onClick={onConfirm}>
            Guardar entrada
          </Button>
        </div>
      }
    >
      {draft ? (
        <div className="flex flex-col gap-4">
          <ClassFormField label="Nombre">
            {(id) => (
              <Input
                id={id}
                placeholder="Ej. General, VIP, Preventa"
                value={draft.name}
                maxLength={80}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            )}
          </ClassFormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <ClassFormField label="Precio (HNL)" hint="Déjalo vacío o en 0 para una entrada gratis.">
              {(id) => (
                <Input
                  id={id}
                  inputMode="decimal"
                  placeholder="350"
                  value={draft.price}
                  onChange={(e) => onChange({ price: e.target.value.replace(/[^0-9.]/g, "") })}
                />
              )}
            </ClassFormField>
            <ClassFormField
              label="Cantidad"
              hint={draft.sold > 0 ? `Ya vendiste ${draft.sold}.` : "Cuántas hay a la venta."}
            >
              {(id) => (
                <Input
                  id={id}
                  inputMode="numeric"
                  placeholder="100"
                  value={draft.total}
                  onChange={(e) => onChange({ total: digits(e.target.value) })}
                />
              )}
            </ClassFormField>
          </div>
          {bundle ? <EventTicketSessionFields key={draft.id} draft={draft} onChange={onChange} /> : null}
          {paid ? (
            <>
              <EventTicketSaleWindowFields
                draft={draft}
                eventStartsAt={ticketStartsAt(draft, eventStartsAt, bundle)}
                onChange={onChange}
              />
              <EventTicketDonationFields draft={draft} onChange={onChange} />
            </>
          ) : (
            <p className="text-[13px] leading-5 text-white/50">
              Las entradas gratis están disponibles desde que se publica el evento.
            </p>
          )}
          {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}
