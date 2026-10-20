"use client";

import { SwitchRow } from "@/components/ui/SwitchRow";

/**
 * Which checkout the event uses. On, anyone pays with name and email and
 * gets the ticket by mail (the simple checkout). Off, the buyer signs in or
 * creates an account before paying (the full checkout), which keeps every
 * purchase on an account from the start.
 */
export function EventCheckoutModeField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <SwitchRow
        label="Permitir comprar sin cuenta"
        hint={
          checked
            ? "Checkout sencillo: nombre, correo, pago y el ticket llega al correo. Quien quiera puede guardarlo después en una cuenta."
            : "Checkout completo: el comprador entra a su cuenta de Allons (código por correo o Google) antes de pagar."
        }
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}
