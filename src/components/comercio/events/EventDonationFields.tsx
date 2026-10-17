import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { SwitchRow } from "@/components/ui/SwitchRow";
import { ClassFormField } from "@/components/comercio/classes/ClassFormField";
import type { useEventDonationInfo } from "@/hooks/event-form/useEventDonationInfo";
import { DONATION_LIMITS } from "@/lib/eventDonations";

/** A titled list with its add button, for accounts and links. */
function RowsBlock({
  title,
  addLabel,
  canAdd,
  onAdd,
  empty,
  hint,
  children,
}: {
  title: string;
  addLabel: string;
  canAdd: boolean;
  onAdd: () => void;
  empty: string | null;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label>{title}</Label>
        <Button variant="secondary" size="sm" disabled={!canAdd} onClick={onAdd}>
          <Plus className="size-4" aria-hidden />
          {addLabel}
        </Button>
      </div>
      {empty ? <p className="text-[13px] text-white/50">{empty}</p> : null}
      {children}
      <p className="text-[12px] leading-5 text-dim">{hint}</p>
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick} className="self-end">
      <Trash2 className="size-4" aria-hidden />
    </Button>
  );
}

/**
 * Bank accounts and links to donate straight to a beneficiary. The event page
 * lists them to copy; the money never goes through Allons.
 */
export function EventDonationFields({ d }: { d: ReturnType<typeof useEventDonationInfo> }) {
  return (
    <Card className="flex flex-col gap-5">
      <SwitchRow
        label="Mostrar cuentas para donar en este evento"
        hint="La página del evento las muestra para copiar. El dinero no pasa por Allons."
        checked={d.enabled}
        onChange={d.setEnabled}
      />
      {d.enabled ? (
        <>
          <ClassFormField
            label="Beneficiario"
            hint='Quién recibe el dinero. Aparece como "Cuentas de ...".'
          >
            {(id) => (
              <Input
                id={id}
                placeholder="Ej. FUNHOCAM"
                value={d.beneficiary}
                maxLength={DONATION_LIMITS.beneficiary}
                onChange={(e) => d.setBeneficiary(e.target.value)}
              />
            )}
          </ClassFormField>

          <RowsBlock
            title="Cuentas bancarias"
            addLabel="Agregar cuenta"
            canAdd={d.canAddAccount}
            onAdd={d.addAccount}
            empty={d.accounts.length === 0 ? "Sin cuentas. Puedes dejar solo enlaces o una nota." : null}
            hint={`Cada cuenta necesita el banco y al menos un número. Hasta ${DONATION_LIMITS.accounts}.`}
          >
            {d.accounts.map((account, index) => (
              <div
                key={account.key}
                className="grid gap-3 rounded-[18px] border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <ClassFormField label="Banco">
                  {(id) => (
                    <Input
                      id={id}
                      placeholder="Ej. BAC Credomatic"
                      value={account.bank}
                      maxLength={DONATION_LIMITS.bank}
                      onChange={(e) => d.updateAccount(account.key, { bank: e.target.value })}
                    />
                  )}
                </ClassFormField>
                <ClassFormField label="Cuenta en lempiras">
                  {(id) => (
                    <Input
                      id={id}
                      inputMode="numeric"
                      placeholder="Número de cuenta"
                      value={account.hnl}
                      maxLength={DONATION_LIMITS.accountNumber}
                      onChange={(e) => d.updateAccount(account.key, { hnl: e.target.value })}
                    />
                  )}
                </ClassFormField>
                <ClassFormField label="Cuenta en dólares">
                  {(id) => (
                    <Input
                      id={id}
                      inputMode="numeric"
                      placeholder="Opcional"
                      value={account.usd}
                      maxLength={DONATION_LIMITS.accountNumber}
                      onChange={(e) => d.updateAccount(account.key, { usd: e.target.value })}
                    />
                  )}
                </ClassFormField>
                <RemoveButton
                  label={`Quitar cuenta ${index + 1}`}
                  onClick={() => d.removeAccount(account.key)}
                />
              </div>
            ))}
          </RowsBlock>

          <RowsBlock
            title="Enlaces"
            addLabel="Agregar enlace"
            canAdd={d.canAddLink}
            onAdd={d.addLink}
            empty={
              d.links.length === 0
                ? "Sin enlaces. Agrega la web o las redes del beneficiario si quieres."
                : null
            }
            hint={`La URL tiene que empezar con https://. Hasta ${DONATION_LIMITS.links} enlaces.`}
          >
            {d.links.map((link, index) => (
              <div
                key={link.key}
                className="grid gap-3 rounded-[18px] border border-border bg-surface p-4 sm:grid-cols-[minmax(0,0.8fr)_1fr_1.4fr_auto]"
              >
                <ClassFormField label="Etiqueta">
                  {(id) => (
                    <Input
                      id={id}
                      placeholder="Ej. Instagram"
                      value={link.label}
                      maxLength={DONATION_LIMITS.label}
                      onChange={(e) => d.updateLink(link.key, { label: e.target.value })}
                    />
                  )}
                </ClassFormField>
                <ClassFormField label="Texto">
                  {(id) => (
                    <Input
                      id={id}
                      placeholder="Ej. @funhocamhn"
                      value={link.value}
                      maxLength={DONATION_LIMITS.value}
                      onChange={(e) => d.updateLink(link.key, { value: e.target.value })}
                    />
                  )}
                </ClassFormField>
                <ClassFormField label="URL">
                  {(id) => (
                    <Input
                      id={id}
                      inputMode="url"
                      placeholder="https://instagram.com/funhocamhn"
                      value={link.href}
                      maxLength={DONATION_LIMITS.href}
                      onChange={(e) => d.updateLink(link.key, { href: e.target.value })}
                    />
                  )}
                </ClassFormField>
                <RemoveButton
                  label={`Quitar enlace ${index + 1}`}
                  onClick={() => d.removeLink(link.key)}
                />
              </div>
            ))}
          </RowsBlock>

          <ClassFormField label="Nota (opcional)" hint="Aparece debajo de las cuentas y los enlaces.">
            {(id) => (
              <div className="flex flex-col gap-1">
                <Textarea
                  id={id}
                  placeholder="Ej. También puedes donar en efectivo en el lugar."
                  value={d.note}
                  rows={3}
                  maxLength={DONATION_LIMITS.note}
                  onChange={(e) => d.setNote(e.target.value)}
                />
                <p className="self-end text-[12px] tabular-nums text-dim">
                  {d.note.length}/{DONATION_LIMITS.note}
                </p>
              </div>
            )}
          </ClassFormField>
        </>
      ) : null}
    </Card>
  );
}
