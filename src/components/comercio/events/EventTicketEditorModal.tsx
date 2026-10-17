import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { TimePicker } from "@/components/ui/TimePicker";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import { ticketPrice, type EventTicketDraft } from "@/hooks/event-form/useEventTicketsForm";
import { todayHN } from "@/lib/dateKeys";

const digits = (value: string) => value.replace(/\D/g, "");

/** Authors one ticket type: name, price, how many, and when it sells. */
export function EventTicketEditorModal({
  draft,
  error,
  onChange,
  onCancel,
  onConfirm,
}: {
  draft: EventTicketDraft | null;
  error: string | null;
  onChange: (patch: Partial<EventTicketDraft>) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const today = todayHN();
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
          {paid ? (
            <>
              <p className="text-[13px] leading-5 text-white/50">
                Venta (opcional). Si la dejas vacía, se vende desde que se publica hasta que
                empieza el evento. Tiene que terminar a más tardar el día del evento.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <ClassFormField label="Inicio de venta">
                  {(id) => (
                    <DateField
                      id={id}
                      value={draft.saleStartDate}
                      min={draft.saleStartDate && draft.saleStartDate < today ? draft.saleStartDate : today}
                      onChange={(saleStartDate) => onChange({ saleStartDate })}
                      placeholder="Desde que se publica"
                    />
                  )}
                </ClassFormField>
                <ClassFormField label="Hora">
                  {(id) => (
                    <TimePicker
                      id={id}
                      value={draft.saleStartTime}
                      onChange={(saleStartTime) => onChange({ saleStartTime })}
                    />
                  )}
                </ClassFormField>
                <ClassFormField label="Fin de venta">
                  {(id) => (
                    <DateField
                      id={id}
                      value={draft.saleEndDate}
                      min={draft.saleStartDate || today}
                      onChange={(saleEndDate) => onChange({ saleEndDate })}
                      placeholder="Cuando empieza el evento"
                    />
                  )}
                </ClassFormField>
                <ClassFormField label="Hora">
                  {(id) => (
                    <TimePicker
                      id={id}
                      value={draft.saleEndTime}
                      onChange={(saleEndTime) => onChange({ saleEndTime })}
                    />
                  )}
                </ClassFormField>
              </div>
              {draft.saleStartDate || draft.saleEndDate || draft.saleStartTime || draft.saleEndTime ? (
                <button
                  type="button"
                  onClick={() =>
                    onChange({ saleStartDate: "", saleStartTime: "", saleEndDate: "", saleEndTime: "" })
                  }
                  className="w-fit text-[13px] font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline"
                >
                  Quitar fechas de venta
                </button>
              ) : null}
            </>
          ) : null}
          {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}
