"use client";

import { useState } from "react";
import { Banknote, Info } from "lucide-react";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { usePayouts } from "@/hooks/usePayouts";
import { isApiError } from "@/lib/api/client";
import { formatHNL, formatShortDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { Badge, EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { KpiTile } from "./KpiTile";

const STATUS: Record<string, { label: string; tone: "warn" | "success" | "neutral" }> = {
  pending: { label: "En proceso", tone: "warn" },
  completed: { label: "Depositado", tone: "success" },
};

/**
 * The comercio's money: what it can withdraw now, what is still held, what
 * Allons and the pasarela withhold, and the history of its payouts.
 */
export function FinanceView() {
  const { dashboard, dashboardLoading, ready } = useProviderAccess({
    withDashboard: true,
  });
  const payouts = usePayouts(ready);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const available = dashboard?.availableBalance ?? 0;
  const commission = dashboard?.commission;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Escribe un monto mayor a cero.");
      return;
    }
    if (value > available) {
      setError("El monto supera tu saldo disponible.");
      return;
    }
    payouts.request.mutate(value, {
      onSuccess: () => setAmount(""),
      onError: (err) =>
        setError(
          isApiError(err) ? err.message : "No pudimos registrar el retiro.",
        ),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle>Saldo</SectionTitle>
        {dashboardLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiTile label="Disponible" value={formatHNL(available)} hint="Listo para retirar" />
            <KpiTile
              label="Pendiente"
              value={formatHNL(dashboard?.pendingBalance ?? 0)}
              hint="Retiros en proceso"
            />
            <KpiTile
              label="Retenido"
              value={formatHNL(dashboard?.heldBalance ?? 0)}
              hint="Ventana de reembolso"
            />
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Retirar</SectionTitle>
        <Card className="flex flex-col gap-4">
          <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="block sm:max-w-56">
              <Label hint="en lempiras">Monto</Label>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                aria-label="Monto a retirar en lempiras"
              />
            </label>
            <Button
              type="submit"
              loading={payouts.request.isPending}
              disabled={available <= 0}
              className="sm:mb-0.5"
            >
              <Banknote className="size-4" aria-hidden />
              Solicitar retiro
            </Button>
          </form>
          <FieldError>{error}</FieldError>
          {payouts.request.isSuccess && !error ? (
            <p className="text-sm text-success">
              Retiro solicitado. Te depositamos en la cuenta registrada con Allons.
            </p>
          ) : null}
          <p className="flex items-start gap-2.5 rounded-[14px] border border-border bg-surface px-4 py-3 text-[13px] leading-relaxed text-dim">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {commission
              ? `De cada venta se retiene ${commission.totalFee}%: ${commission.baseFee}% de Allons${
                  commission.planName ? ` (plan ${commission.planName})` : ""
                } y ${commission.pasarelaFee}% de la pasarela. El depósito va a la cuenta bancaria que registraste con Allons.`
              : "El depósito va a la cuenta bancaria que registraste con Allons."}
          </p>
        </Card>
      </section>

      <section>
        <SectionTitle>Historial</SectionTitle>
        {payouts.query.isLoading ? (
          <Skeleton className="h-40" />
        ) : payouts.query.error ? (
          <ErrorState
            message={(payouts.query.error as Error).message}
            onRetry={() => void payouts.query.refetch()}
          />
        ) : payouts.rows.length === 0 ? (
          <EmptyState
            title="Sin retiros todavía"
            body="Cuando solicites uno aparecerá aquí con su estado."
          />
        ) : (
          <Card padding="none">
            <ul className="divide-y divide-white/[0.06]">
              {payouts.rows.map((row) => {
                const status = STATUS[row.status] ?? {
                  label: row.status,
                  tone: "neutral" as const,
                };
                return (
                  <li key={row.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold tabular-nums tracking-tight">
                        {formatHNL(row.amount)}
                      </p>
                      <p className="mt-0.5 truncate text-[13px] text-white/45">
                        {row.method}
                        {formatShortDate(row.date) ? ` · ${formatShortDate(row.date)}` : ""}
                      </p>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
