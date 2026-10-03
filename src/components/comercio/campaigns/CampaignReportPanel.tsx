"use client";

import { Download, FileText } from "lucide-react";
import type { CampaignReport } from "@/lib/api/campaigns";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { Stat } from "@/components/ui/Stat";
import { formatRate } from "./campaignFormat";

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Row({
  title,
  subtitle,
  registered,
  attended,
  rate,
}: {
  title: string;
  subtitle?: string;
  registered: number;
  attended: number;
  rate: number;
}) {
  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{title}</p>
          {subtitle ? <p className="truncate text-[12px] text-dim">{subtitle}</p> : null}
        </div>
        <p className="shrink-0 text-[13px] text-white/60">
          {attended}/{registered} · {formatRate(rate)}
        </p>
      </div>
      <Bar value={attended} max={registered} />
    </div>
  );
}

/** Attendance totals, per comercio and event, answers, and the exports. */
export function CampaignReportPanel({
  report,
  exporting,
  onExport,
}: {
  report: CampaignReport;
  exporting: "pdf" | "csv" | null;
  onExport: (format: "pdf" | "csv") => void;
}) {
  const t = report.totals;
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Comercios" value={t.comercios} />
        <Stat label="Registrados" value={t.registered.toLocaleString("es-HN")} />
        <Stat label="Asistentes" value={t.attended.toLocaleString("es-HN")} />
        <Stat label="Asistencia" value={formatRate(t.attendanceRate)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="white" loading={exporting === "pdf"} disabled={Boolean(exporting)} onClick={() => onExport("pdf")}>
          <FileText className="size-4" aria-hidden />
          Exportar PDF
        </Button>
        <Button variant="secondary" loading={exporting === "csv"} disabled={Boolean(exporting)} onClick={() => onExport("csv")}>
          <Download className="size-4" aria-hidden />
          Exportar CSV
        </Button>
      </div>

      <section>
        <SectionTitle>Por comercio</SectionTitle>
        {report.byComercio.length === 0 ? (
          <EmptyState title="Todavía sin comercios" body="Cuando un comercio sume eventos, su asistencia aparece aquí." />
        ) : (
          <Card className="divide-y divide-border">
            {report.byComercio.map((c) => (
              <Row key={c.providerId} title={c.name} subtitle={`${c.events} eventos`} registered={c.registered} attended={c.attended} rate={c.attendanceRate} />
            ))}
          </Card>
        )}
      </section>

      {report.byEvent.length > 0 ? (
        <section>
          <SectionTitle>Por evento</SectionTitle>
          <Card className="divide-y divide-border">
            {report.byEvent.map((e) => (
              <Row
                key={e.eventId}
                title={e.title}
                subtitle={[e.providerName, e.removedAt ? "Retirado" : null].filter(Boolean).join(" · ")}
                registered={e.registered}
                attended={e.attended}
                rate={e.attendanceRate}
              />
            ))}
          </Card>
        </section>
      ) : null}

      {report.questions.length > 0 ? (
        <section>
          <SectionTitle>Respuestas</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {report.questions.map((q) => (
              <Card key={q.id} className="flex flex-col gap-2">
                <p className="font-semibold">{q.label}</p>
                <p className="text-[12px] text-dim">{q.answered} respuestas</p>
                {q.options?.map((o) => (
                  <div key={o.option} className="flex flex-col gap-1">
                    <div className="flex justify-between gap-3 text-[13px]">
                      <span className="truncate text-white/60">{o.option}</span>
                      <span className="font-semibold">{o.count}</span>
                    </div>
                    <Bar value={o.count} max={q.answered} />
                  </div>
                ))}
                {q.numeric ? (
                  <p className="text-[13px] text-white/60">
                    Promedio {q.numeric.average} · mínimo {q.numeric.min} · máximo {q.numeric.max}
                  </p>
                ) : null}
                {!q.options && !q.numeric ? (
                  <p className="text-[13px] text-white/60">Respuestas abiertas: el detalle está en el CSV.</p>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
