"use client";

import { Check } from "lucide-react";
import type { PaymentMethod } from "@/lib/api/paymentMethods";
import { BRAND_LABEL } from "@/lib/cards";
import { CardBrandMark, brandFromLabel } from "./CardBrandMark";

/** One selectable option in the payment step: a saved card or a custom row. */
export function OptionRow({
  selected,
  disabled,
  onSelect,
  leading,
  title,
  subtitle,
  trailing,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  leading: React.ReactNode;
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
      className={`flex w-full items-center gap-4 rounded-[18px] border px-4 py-3.5 text-left transition duration-200 disabled:opacity-50 ${
        selected
          ? "border-accent/60 bg-accent/[0.08] shadow-[0_0_0_1px_rgba(246,112,16,0.35)]"
          : "border-border bg-surface hover:border-border-strong hover:bg-surface-2"
      }`}
    >
      <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-[10px] bg-black/40 ring-1 ring-white/10">
        {leading}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold tracking-tight">{title}</span>
        {subtitle ? (
          <span className="block truncate text-[12px] text-dim">{subtitle}</span>
        ) : null}
      </span>
      {trailing}
      <span
        aria-hidden
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition ${
          selected ? "border-accent bg-accent text-black" : "border-white/20"
        }`}
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
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
      leading={<CardBrandMark brand={brand} className="h-5" />}
      title={
        <span className="font-mono text-[15px] tabular-nums tracking-[0.14em]">
          •••• {card.last4 ?? "????"}
        </span>
      }
      subtitle={[BRAND_LABEL[brand], expiry ? `Vence ${expiry}` : null]
        .filter(Boolean)
        .join(" · ")}
      trailing={
        card.isDefault ? (
          <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55 ring-1 ring-white/10">
            Predeterminada
          </span>
        ) : undefined
      }
    />
  );
}
