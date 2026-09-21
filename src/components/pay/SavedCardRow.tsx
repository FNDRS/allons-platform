"use client";

import { Check } from "lucide-react";
import type { PaymentMethod } from "@/lib/api/paymentMethods";
import { CardBrandMark, brandFromLabel } from "./CardBrandMark";

/** One selectable option in the payment step: a saved card or a custom row. */
export function OptionRow({
  selected,
  disabled,
  onSelect,
  leading,
  framedLeading = true,
  title,
  subtitle,
  trailing,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  leading: React.ReactNode;
  framedLeading?: boolean;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-3.5 rounded-[20px] border px-3.5 py-3 text-left transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-50 ${
        selected
          ? "border-accent/35 bg-[#0c0c0e] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(246,112,16,0.2),0_10px_28px_rgba(246,112,16,0.08)]"
          : "border-white/8 bg-white/3 hover:border-white/14 hover:bg-white/5"
      }`}
    >
      {framedLeading ? (
        <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10">
          {leading}
        </span>
      ) : (
        leading
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold tracking-tight">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[12px] tracking-tight text-white/40">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing}
      <span
        aria-hidden
        className={`flex size-4.5 shrink-0 items-center justify-center rounded-full transition ${
          selected
            ? "bg-accent text-black shadow-[0_0_12px_rgba(246,112,16,0.4)]"
            : "border border-white/18"
        }`}
      >
        {selected ? <Check className="size-2.5" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

export function SavedCardRow({
  card,
  selected,
  disabled,
  onSelect,
}: {
  card: PaymentMethod;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const brand = brandFromLabel(card.brand);
  const expiry = card.validThru
    ? `${card.validThru.slice(0, 2)}/${card.validThru.slice(2)}`
    : null;
  return (
    <OptionRow
      selected={selected}
      disabled={disabled}
      onSelect={onSelect}
      framedLeading={false}
      leading={<CardBrandMark brand={brand} framed />}
      title={
        <span className="font-mono text-[15px] tabular-nums tracking-[0.18em] text-white/92">
          •••• {card.last4 ?? "????"}
        </span>
      }
      subtitle={expiry ? `Vence ${expiry}` : "Tarjeta guardada"}
      trailing={
        card.isDefault ? (
          <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/38 ring-1 ring-white/10">
            Predeterminada
          </span>
        ) : undefined
      }
    />
  );
}
