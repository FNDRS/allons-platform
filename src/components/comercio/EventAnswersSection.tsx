"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getProviderEventAnswers,
  providerKeys,
  type ProviderEventAnswers,
} from "@/lib/api/provider";
import {
  exportTable,
  fileSlug,
  toTsv,
  type ExportColumn,
  type ExportFormat,
} from "@/lib/export/table";
import { Card } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { ExportMenu } from "./ExportMenu";

type Attendee = ProviderEventAnswers["attendees"][number];

/** The kit list: one row per ticket, with every answer in its own column. */
async function exportKits(
  data: ProviderEventAnswers,
  eventTitle: string,
  format: ExportFormat | "copy",
) {
  const columns: ExportColumn<Attendee>[] = [
    { key: "nombre", header: "Nombre", kind: "text", width: 30, value: (a) => a.name },
    { key: "codigo", header: "Código", kind: "text", width: 14, value: (a) => a.code },
    { key: "entrada", header: "Entrada", kind: "text", width: 20, value: (a) => a.ticketType ?? "" },
    ...data.questions.map(
      (question): ExportColumn<Attendee> => ({
        key: `respuesta_${question.id}`,
        header: question.label,
        kind: "text",
        width: 22,
        value: (a) => a.answers[question.id] ?? "Sin respuesta",
      }),
    ),
  ];
  const rows = [...data.attendees].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const table = {
    title: `Kits · ${eventTitle}`,
    subtitle: [`${rows.length} ${rows.length === 1 ? "asistente" : "asistentes"}`],
    columns,
    rows,
  };
  if (format === "copy") {
    await navigator.clipboard.writeText(toTsv(table));
    toast.success("Tabla copiada. Pégala en Excel o Google Sheets.");
    return;
  }
  await exportTable(table, format, `${fileSlug(eventTitle)}-kits`);
}

/**
 * What each attendee answered at checkout, e.g. their shirt size for the kit.
 * The tally comes first because that is what a comercio orders stock from;
 * the per-person list is for handing things out at the desk.
 */
export function EventAnswersSection({
  eventId,
  eventTitle,
  enabled,
}: {
  eventId: string;
  eventTitle: string;
  enabled: boolean;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const answers = useQuery({
    queryKey: providerKeys.answers(eventId),
    queryFn: () => getProviderEventAnswers(eventId),
    enabled,
  });

  if (answers.isLoading) return <Skeleton className="h-40 rounded-[24px]" />;
  if (answers.error) {
    return (
      <ErrorState
        message={(answers.error as Error).message}
        onRetry={() => void answers.refetch()}
      />
    );
  }
  const data = answers.data;
  if (!data || data.questions.length === 0) return null;

  const attendees = data.attendees;
  const tallies = data.questions.map((question) => {
    const counts = new Map<string, number>();
    let unanswered = 0;
    for (const attendee of attendees) {
      const value = attendee.answers[question.id];
      if (!value) {
        unanswered += 1;
        continue;
      }
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return {
      question,
      counts: [...counts.entries()].sort((a, b) => b[1] - a[1]),
      unanswered,
    };
  });

  return (
    <section>
      <div className="mb-3 flex min-w-0 items-baseline justify-between gap-3">
        <h2 className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[12px] sm:tracking-[0.2em]">
          Respuestas del formulario
          {attendees.length > 0 ? (
            <span className="ml-1.5 text-white/40">{attendees.length}</span>
          ) : null}
        </h2>
        {attendees.length > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            <ExportMenu
              count={attendees.length}
              caption={`${attendees.length} ${attendees.length === 1 ? "asistente" : "asistentes"}`}
              onExport={(format) => exportKits(data, eventTitle, format)}
            />
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 px-3.5 text-[13px] ${glassCtaClass}`}
            >
              {collapsed ? "Ver asistentes" : "Ocultar"}
              {collapsed ? (
                <ChevronDown className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
              ) : (
                <ChevronUp className="size-3.5 text-white/45" strokeWidth={1.5} aria-hidden />
              )}
            </button>
          </div>
        ) : null}
      </div>

      {attendees.length === 0 ? (
        <Card>
          <p className="text-[14px] text-white/50">
            Las respuestas de {data.questions.map((q) => `“${q.label}”`).join(", ")} aparecen
            aquí con cada compra.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {tallies.map(({ question, counts, unanswered }) => (
            <Card key={question.id}>
              <p className="text-[14px] font-semibold tracking-tight">{question.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {counts.map(([value, count]) => (
                  <span
                    key={value}
                    className="inline-flex items-center gap-2 rounded-full bg-white/[0.045] px-3 py-1.5 text-[13px] ring-1 ring-white/[0.08]"
                  >
                    <span className="font-semibold text-white/90">{value}</span>
                    <span className="tabular-nums text-white/50">{count}</span>
                  </span>
                ))}
                {unanswered > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] text-white/40 ring-1 ring-white/[0.06]">
                    Sin respuesta <span className="tabular-nums">{unanswered}</span>
                  </span>
                ) : null}
              </div>
            </Card>
          ))}

          {collapsed ? null : (
            <Card padding="none" className="divide-y divide-border">
              {attendees.map((attendee) => (
                <div
                  key={attendee.ticketId}
                  className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-white/90">
                      {attendee.name}
                    </p>
                    <p className="font-mono text-[12px] tracking-[0.06em] text-white/40">
                      {attendee.code}
                      {attendee.ticketType ? (
                        <span className="font-sans tracking-normal"> · {attendee.ticketType}</span>
                      ) : null}
                    </p>
                  </div>
                  <p className="text-[13px] text-white/70 sm:text-right">
                    {data.questions
                      .map((question) => {
                        const value = attendee.answers[question.id];
                        return data.questions.length === 1
                          ? (value ?? "Sin respuesta")
                          : `${question.label}: ${value ?? "Sin respuesta"}`;
                      })
                      .join(" · ")}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
