"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { EventDonationInfo } from "@/lib/eventDonations";

const COPIED_MS = 1600;

function HeartMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden>
      <path
        d="M12 19.5s-7.25-4.35-7.25-9.6A4.15 4.15 0 0 1 12 7.35a4.15 4.15 0 0 1 7.25 2.55c0 5.25-7.25 9.6-7.25 9.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountNumber({ label, number }: { label: string; number: string }) {
  const [copied, setCopied] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (reset.current) clearTimeout(reset.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(number.replace(/\D/g, ""));
      setCopied(true);
      if (reset.current) clearTimeout(reset.current);
      reset.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      /* clipboard blocked: the number is still visible */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="flex min-w-0 items-center justify-between gap-3 rounded-[12px] bg-white/[0.035] px-3 py-2 text-left ring-1 ring-white/[0.06] transition hover:bg-white/[0.06]"
      aria-label={copied ? "Número copiado" : `Copiar cuenta en ${label}: ${number}`}
      aria-live="polite"
    >
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">
          {label}
        </span>
        <span className="block truncate text-[15px] font-semibold tabular-nums tracking-tight text-white/90">
          {number}
        </span>
      </span>
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full transition ${
          copied ? "bg-success/15 text-success" : "bg-white/[0.06] text-white/60"
        }`}
      >
        {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      </span>
    </button>
  );
}

/**
 * "¿Quieres aportar más?": the beneficiary's own bank accounts and channels.
 * `compact` stacks the lempiras and dollars accounts for a narrow side column.
 */
export function DonationCard({
  info,
  compact = false,
}: {
  info: EventDonationInfo;
  compact?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-white/[0.045] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/[0.08]">
          <HeartMark />
        </span>
        <div>
          <p className="text-[15px] font-bold tracking-tight">¿Quieres aportar más?</p>
          <p className="mt-1 text-sm leading-6 text-white/70">
            Puedes donar directo a {info.beneficiary} con un depósito o una transferencia a
            cualquiera de estas cuentas. Toca un número para copiarlo.
          </p>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-white/[0.06]">
        {info.accounts.map((account) => (
          <li key={account.bank} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
            <p className="text-[13px] font-semibold text-white/80">{account.bank}</p>
            <div className={`grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
              {account.hnl ? <AccountNumber label="Lempiras" number={account.hnl} /> : null}
              {account.usd ? <AccountNumber label="Dólares" number={account.usd} /> : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {info.links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.045] px-3 py-1.5 text-[13px] ring-1 ring-white/[0.08] transition hover:bg-white/[0.08]"
          >
            <span className="text-white/45">{link.label}</span>
            <span className="font-semibold text-white/85">{link.value}</span>
          </a>
        ))}
      </div>
    </Card>
  );
}
