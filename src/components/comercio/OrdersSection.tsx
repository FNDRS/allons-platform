"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Ticket,
  Users,
  X,
} from "lucide-react";
import type {
  ProviderEventAnswers,
  ProviderFreeReservation,
  ProviderPaymentRow,
  ProviderTicketType,
} from "@/lib/api/provider";
import { formatCents, formatDateTime, formatNumber } from "@/lib/format";
import {
  exportTable,
  fileSlug,
  toTsv,
  type ExportColumn,
  type ExportFormat,
  type ExportTable,
} from "@/lib/export/table";
import { Card, SectionTitle } from "@/components/ui/Card";
import { SmoothInput } from "@/components/ui/SmoothInput";
import { Chip } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/States";
import { glassCtaClass } from "@/components/ui/cta";
import { useDismiss } from "@/components/ui/useDismiss";
import { ExportMenu } from "./ExportMenu";

type OrderStatus =
  | "paid"
  | "courtesy"
  | "reservation"
  | "pending_payment"
  | "refunded"
  | "cancelled"
  | "failed";

const STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "Pagado",
  courtesy: "Cortesía",
  reservation: "Reserva",
  pending_payment: "Pendiente",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
  failed: "Falló",
};

/** Filter chips follow this order; only statuses with orders show up. */
const STATUS_ORDER: OrderStatus[] = [
  "paid",
  "courtesy",
  "reservation",
  "pending_payment",
  "refunded",
  "cancelled",
  "failed",
];

const STATUS_DOT: Record<OrderStatus, string> = {
  paid: "bg-success",
  courtesy: "bg-accent",
  reservation: "bg-sky-400",
  pending_payment: "bg-amber-400",
  refunded: "bg-white/35",
  cancelled: "bg-danger",
  failed: "bg-danger",
};

type SortKey = "newest" | "oldest" | "amount_desc" | "amount_asc";

const SORT_LABEL: Record<SortKey, string> = {
  newest: "Más recientes",
  oldest: "Más antiguos",
  amount_desc: "Mayor monto",
  amount_asc: "Menor monto",
};

const PAGE_SIZE = 25;

/** One row of the list, whether it came from a paid order or a free reservation. */
interface OrderLine {
  id: string;
  /** What a comercio reads back to a buyer: the gateway reference, or the start of the id. */
  code: string;
  createdAt: string;
  status: OrderStatus | string;
  typeId: string | null;
  typeName: string;
  quantity: number;
  attendees: string[];
  /**
   * Checkout answers per question id, one entry per ticket, in the same
   * order as `attendees`. Empty when the event asks nothing.
   */
  answers: Record<string, string[]>;
  amountCents: number;
  donationCents: number;
}

type AnswerAttendee = ProviderEventAnswers["attendees"][number];

/**
 * Tickets with answers, grouped the way the list groups them: by paid order,
 * or for a free reservation by the instant its tickets were minted (they
 * share `created_at`, which is how the API groups reservations too).
 */
function groupAnswers(answers: ProviderEventAnswers | undefined) {
  const groups = new Map<string, AnswerAttendee[]>();
  for (const attendee of answers?.attendees ?? []) {
    const key = attendee.orderId ?? `free:${new Date(attendee.createdAt).getTime()}`;
    const list = groups.get(key);
    if (list) list.push(attendee);
    else groups.set(key, [attendee]);
  }
  return groups;
}

/**
 * Puts each line's ticket holders and their answers side by side. With
 * answers the names come from those same tickets, so name and shirt size
 * can't drift apart.
 */
function withAnswers(
  line: OrderLine,
  group: AnswerAttendee[] | undefined,
  questions: ProviderEventAnswers["questions"],
): OrderLine {
  if (!group || questions.length === 0) return line;
  return {
    ...line,
    attendees: group.map((attendee) => attendee.name),
    answers: Object.fromEntries(
      questions.map((question) => [
        question.id,
        group.map((attendee) => attendee.answers[question.id] ?? "Sin respuesta"),
      ]),
    ),
  };
}

function toLines(
  rows: ProviderPaymentRow[],
  reservations: ProviderFreeReservation[],
  typeById: Map<string, ProviderTicketType>,
  answers: ProviderEventAnswers | undefined,
): OrderLine[] {
  const groups = groupAnswers(answers);
  const questions = answers?.questions ?? [];
  const orders = rows.map((row): OrderLine => {
    const type = row.entryTypeId ? typeById.get(row.entryTypeId) : undefined;
    const isCourtesy =
      row.status === "paid" && row.amountCents === 0 && (type?.price ?? 0) > 0;
    return {
      id: row.orderId,
      code: row.authCode || row.orderId.slice(0, 8).toUpperCase(),
      createdAt: row.createdAt,
      status: isCourtesy ? "courtesy" : row.status,
      typeId: row.entryTypeId ?? null,
      typeName: type?.name ?? "",
      quantity: row.quantity,
      attendees: (row.holders ?? []).map((holder) => holder.name.trim()).filter(Boolean),
      answers: {},
      amountCents: row.amountCents,
      donationCents: row.donationCents ?? 0,
    };
  }).map((line) => withAnswers(line, groups.get(line.id), questions));
  const free = reservations.map((row): OrderLine => {
    const holders = row.holders.map((holder) => holder.name.trim()).filter(Boolean);
    return {
      id: row.reservationId,
      code: row.reservationId.slice(0, 8).toUpperCase(),
      createdAt: row.createdAt,
      status: "reservation",
      typeId: row.entryTypeId,
      typeName: row.entryTypeId ? typeById.get(row.entryTypeId)?.name ?? "" : "",
      quantity: row.quantity,
      attendees: holders.length > 0 ? holders : row.buyerName ? [row.buyerName] : [],
      answers: {},
      amountCents: 0,
      donationCents: 0,
    };
  }).map((line) =>
    withAnswers(line, groups.get(`free:${new Date(line.createdAt).getTime()}`), questions),
  );
  return [...orders, ...free];
}

/** "Ana (M)" with one question; "Ana (Talla: M · Distancia: 5K)" with more. */
function attendeeLabels(
  line: OrderLine,
  questions: ProviderEventAnswers["questions"],
): string[] {
  const asked = questions.filter((question) => line.answers[question.id]);
  if (asked.length === 0) return line.attendees;
  return line.attendees.map((name, index) => {
    const parts = asked.map((question) => {
      const value = line.answers[question.id][index];
      return asked.length === 1 ? value : `${question.label}: ${value}`;
    });
    return `${name} (${parts.join(" · ")})`;
  });
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status as OrderStatus] ?? status;
}

/** Money that actually came in: paid orders only, courtesies are L 0 anyway. */
function isCollected(line: OrderLine) {
  return line.status === "paid" || line.status === "courtesy";
}

/** Locale-proof "2026-10-17 14:30" in Honduras time, so spreadsheets sort it right. */
function exportDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Tegucigalpa",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

/** One column per checkout question, values in the same order as the names. */
function answerColumns(
  questions: ProviderEventAnswers["questions"],
): ExportColumn<OrderLine>[] {
  return questions.map((question) => ({
    key: `respuesta_${question.id}`,
    header: question.label,
    kind: "text",
    width: 22,
    value: (line) => (line.answers[question.id] ?? []).join(", "),
  }));
}

const EXPORT_COLUMNS: ExportColumn<OrderLine>[] = [
  { key: "fecha", header: "Fecha", kind: "text", width: 18, value: (line) => exportDate(line.createdAt) },
  { key: "codigo", header: "Código", kind: "text", width: 14, value: (line) => line.code },
  { key: "estado", header: "Estado", kind: "text", width: 13, value: (line) => statusLabel(line.status) },
  { key: "tipoEntrada", header: "Tipo de entrada", kind: "text", width: 22, value: (line) => line.typeName },
  { key: "cantidad", header: "Cantidad", kind: "int", width: 10, value: (line) => line.quantity },
  { key: "asistentes", header: "Asistentes", kind: "text", width: 40, value: (line) => line.attendees.join(", ") },
  { key: "aporte", header: "Aporte (HNL)", kind: "money", width: 13, value: (line) => line.donationCents / 100 },
  { key: "monto", header: "Monto (HNL)", kind: "money", width: 14, value: (line) => line.amountCents / 100 },
  { key: "idPedido", header: "ID del pedido", kind: "text", width: 38, value: (line) => line.id },
];

/**
 * Inline dropdown for the filters. Not the shared Radix Select: that one is
 * modal (locks scroll and every click outside), so when its list landed
 * off-screen here the whole page looked frozen. This one scrolls inside,
 * opens upward when there's no room below, and leaves the page alone.
 */
function Dropdown({
  value,
  options,
  onChange,
  label,
  className = "",
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [upward, setUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const selected = options.find((option) => option.value === value);

  function toggle() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      setUpward(below < 280 && rect.top > below);
    }
    setOpen((current) => !current);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
        className={`group flex h-12 w-full items-center justify-between gap-2 rounded-[14px] border px-4 text-left text-[15px] text-white outline-none transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:border-accent/60 ${
          open ? "border-white/20 bg-white/[0.08]" : "border-border bg-surface-2"
        }`}
      >
        <span className="truncate">{selected?.label ?? label}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-dim transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label={label}
          className={`absolute left-0 right-0 z-50 max-h-72 min-w-full overflow-y-auto overscroll-contain rounded-[14px] border border-border-strong bg-[#0c0c0e] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.55)] ${
            upward ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`relative flex w-full items-center rounded-[10px] py-2.5 pl-8 pr-3 text-left text-[15px] text-white transition-colors hover:bg-white/[0.08] ${
                  active ? "font-semibold" : ""
                }`}
              >
                {active ? (
                  <Check className="absolute left-2.5 size-3.5 text-accent" aria-hidden />
                ) : null}
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-white/70">
      <span
        aria-hidden
        className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[status as OrderStatus] ?? "bg-white/30"}`}
      />
      {statusLabel(status)}
    </span>
  );
}

function amountText(line: OrderLine) {
  return line.status === "reservation" ? "Gratis" : formatCents(line.amountCents);
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
      <p className="truncate text-[12px] text-white/45">{label}</p>
      <p className="mt-1 truncate text-[18px] font-bold tracking-[-0.02em] tabular-nums">
        {value}
      </p>
    </div>
  );
}

/**
 * Every order and free reservation for an event, as a searchable, filterable
 * list with totals, exportable to PDF, Excel, CSV or JSON. Exports always
 * carry exactly the rows on screen, filters included.
 */
export function OrdersSection({
  eventTitle,
  rows,
  reservations = [],
  types,
  answers,
}: {
  eventTitle: string;
  rows: ProviderPaymentRow[];
  /** Free reservations, which have no payment order. */
  reservations?: ProviderFreeReservation[];
  types: ProviderTicketType[];
  /** Checkout answers per ticket (shirt size and so on), when the event asks any. */
  answers?: ProviderEventAnswers;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [typeId, setTypeId] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(0);

  const typeById = useMemo(() => new Map(types.map((type) => [type.id, type])), [types]);
  const lines = useMemo(
    () => toLines(rows, reservations, typeById, answers),
    [rows, reservations, typeById, answers],
  );
  const questions = useMemo(() => answers?.questions ?? [], [answers]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const line of lines) counts.set(line.status, (counts.get(line.status) ?? 0) + 1);
    return counts;
  }, [lines]);
  const statusChips = [
    ...STATUS_ORDER.filter((key) => statusCounts.has(key)),
    // Anything the API sends that this list doesn't know yet still gets a chip.
    ...[...statusCounts.keys()].filter((key) => !STATUS_ORDER.includes(key as OrderStatus)),
  ];
  const typesInUse = types.filter((type) => lines.some((line) => line.typeId === type.id));

  const filtered = useMemo(() => {
    const needle = query
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .toLowerCase();
    const result = lines.filter((line) => {
      if (status !== "all" && line.status !== status) return false;
      if (typeId !== "all" && line.typeId !== typeId) return false;
      if (!needle) return true;
      const haystack = [
        line.code,
        line.id,
        line.typeName,
        ...line.attendees,
        ...Object.values(line.answers).flat(),
      ]
        .join(" ")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
      return haystack.includes(needle);
    });
    const time = (line: OrderLine) => new Date(line.createdAt).getTime();
    return result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return time(a) - time(b);
        case "amount_desc":
          return b.amountCents - a.amountCents || time(b) - time(a);
        case "amount_asc":
          return a.amountCents - b.amountCents || time(b) - time(a);
        default:
          return time(b) - time(a);
      }
    });
  }, [lines, query, status, typeId, sort]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, line) => {
          acc.tickets += line.quantity;
          if (isCollected(line)) {
            acc.collectedCents += line.amountCents;
            acc.donationCents += line.donationCents;
          }
          return acc;
        },
        { tickets: 0, collectedCents: 0, donationCents: 0 },
      ),
    [filtered],
  );

  const filtersActive = query.trim() !== "" || status !== "all" || typeId !== "all";
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // A filter can shrink the list under the page you were on.
  const currentPage = Math.min(page, pageCount - 1);
  const pageStart = currentPage * PAGE_SIZE;
  const shown = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function changeSort(next: SortKey) {
    setSort(next);
    setPage(0);
  }

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setTypeId("all");
    setPage(0);
  }

  async function handleExport(format: ExportFormat | "copy") {
    const filterNotes = [
      status !== "all" ? `Estado: ${statusLabel(status)}` : null,
      typeId !== "all" ? `Entrada: ${typeById.get(typeId)?.name ?? ""}` : null,
      query.trim() ? `Búsqueda: "${query.trim()}"` : null,
    ].filter(Boolean);
    const table: ExportTable<OrderLine> = {
      title: `Pedidos · ${eventTitle}`,
      subtitle: [
        `${filtered.length} pedidos · ${totals.tickets} tickets · Cobrado ${formatCents(totals.collectedCents)}`,
        filterNotes.length > 0 ? `Filtros: ${filterNotes.join(" · ")}` : "Todos los pedidos",
        `Generado ${exportDate(new Date().toISOString())} (hora de Honduras)`,
      ],
      // The PDF has no room for the full order id; spreadsheets keep it.
      columns: EXPORT_COLUMNS.filter(
        (column) => format !== "pdf" || column.key !== "idPedido",
      ).flatMap((column) =>
        // Answers sit next to the names they belong to.
        column.key === "asistentes" ? [column, ...answerColumns(questions)] : [column],
      ),
      rows: filtered,
      totals: {
        fecha: "Total",
        cantidad: totals.tickets,
        aporte: totals.donationCents / 100,
        monto: totals.collectedCents / 100,
      },
    };
    if (format === "copy") {
      await navigator.clipboard.writeText(toTsv(table));
      toast.success("Tabla copiada. Pégala en Excel o Google Sheets.");
      return;
    }
    await exportTable(table, format, `${fileSlug(eventTitle)}-pedidos`);
  }

  return (
    <section>
      <SectionTitle
        action={
          <ExportMenu
            count={filtered.length}
            caption={`${filtered.length} ${filtered.length === 1 ? "pedido" : "pedidos"} con los filtros actuales`}
            onExport={handleExport}
          />
        }
      >
        Pedidos
        {lines.length > 0 ? <span className="ml-1.5 text-white/40">{lines.length}</span> : null}
      </SectionTitle>

      {lines.length === 0 ? (
        <EmptyState
          title="Todavía no hay pedidos"
          body="Las compras y las reservas gratis aparecen aquí."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryTile label="Pedidos" value={formatNumber(filtered.length)} />
            <SummaryTile label="Tickets" value={formatNumber(totals.tickets)} />
            <SummaryTile label="Cobrado" value={formatCents(totals.collectedCents)} />
            <SummaryTile
              label="Aportes"
              value={totals.donationCents > 0 ? formatCents(totals.donationCents) : "—"}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <SmoothInput
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(0);
                }}
                placeholder="Buscar por nombre o código"
                aria-label="Buscar pedidos"
                prefix={<Search className="size-4 text-dim" aria-hidden />}
                wrapperClassName="sm:flex-1"
                className="[&::-webkit-search-cancel-button]:hidden"
              />
              {typesInUse.length > 1 ? (
                <Dropdown
                  value={typeId}
                  onChange={(value) => {
                    setTypeId(value);
                    setPage(0);
                  }}
                  label="Filtrar por tipo de entrada"
                  className="sm:w-52"
                  options={[
                    { value: "all", label: "Todas las entradas" },
                    ...typesInUse.map((type) => ({ value: type.id, label: type.name })),
                  ]}
                />
              ) : null}
              <Dropdown
                value={sort}
                onChange={(value) => changeSort(value as SortKey)}
                label="Ordenar pedidos"
                className="sm:w-48"
                options={(Object.keys(SORT_LABEL) as SortKey[]).map((key) => ({
                  value: key,
                  label: SORT_LABEL[key],
                }))}
              />
            </div>

            {statusChips.length > 1 ? (
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                <Chip
                  active={status === "all"}
                  onClick={() => {
                    setStatus("all");
                    setPage(0);
                  }}
                >
                  Todos <span className="ml-1 opacity-60">{lines.length}</span>
                </Chip>
                {statusChips.map((key) => (
                  <Chip
                    key={key}
                    active={status === key}
                    onClick={() => {
                      setStatus(key);
                      setPage(0);
                    }}
                  >
                    {statusLabel(key)}{" "}
                    <span className="ml-1 opacity-60">{statusCounts.get(key)}</span>
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="Ningún pedido coincide"
              body="Prueba con otro nombre o quita los filtros."
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`inline-flex h-9 items-center gap-1.5 px-3.5 text-[13px] ${glassCtaClass}`}
                >
                  <X className="size-3.5" strokeWidth={1.5} aria-hidden />
                  Quitar filtros
                </button>
              }
            />
          ) : (
            <>
              {/* Phones get stacked rows; a seven-column table doesn't fit. */}
              <Card padding="none" className="divide-y divide-border md:hidden">
                {shown.map((line) => (
                  <article key={line.id} className="flex flex-col gap-2 px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-white/90">
                          {line.attendees[0] ?? "Sin nombre"}
                          {line.attendees.length > 1 ? (
                            <span className="font-normal text-white/45">
                              {" "}
                              +{line.attendees.length - 1}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-[12px] text-white/45">
                          {formatDateTime(line.createdAt) ?? "—"} · {line.code}
                        </p>
                      </div>
                      <p className="shrink-0 text-[15px] font-semibold tabular-nums">
                        {amountText(line)}
                      </p>
                    </div>
                    {Object.keys(line.answers).length > 0 ? (
                      <p className="text-[12px] text-white/60">
                        {attendeeLabels(line, questions).join(", ")}
                      </p>
                    ) : null}
                    <div className="flex items-center justify-between gap-3 text-[12px] text-white/50">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Ticket className="size-3.5 shrink-0 text-white/35" strokeWidth={1.5} aria-hidden />
                        <span className="truncate">
                          {line.quantity}
                          {line.typeName ? ` · ${line.typeName}` : ""}
                        </span>
                      </span>
                      <StatusBadge status={line.status} />
                    </div>
                  </article>
                ))}
              </Card>

              <Card padding="none" className="hidden overflow-x-auto md:block">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-left text-[12px] text-white/45">
                      <th className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          onClick={() => changeSort(sort === "newest" ? "oldest" : "newest")}
                          className="inline-flex items-center gap-1 transition hover:text-white"
                        >
                          Fecha
                          <ArrowDownUp className="size-3" strokeWidth={1.5} aria-hidden />
                        </button>
                      </th>
                      <th className="px-4 py-3 font-medium">Asistentes</th>
                      <th className="px-4 py-3 font-medium">Entrada</th>
                      <th className="px-4 py-3 text-right font-medium">Cant.</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 text-right font-medium">
                        <button
                          type="button"
                          onClick={() =>
                            changeSort(sort === "amount_desc" ? "amount_asc" : "amount_desc")
                          }
                          className="inline-flex items-center gap-1 transition hover:text-white"
                        >
                          Monto
                          <ArrowDownUp className="size-3" strokeWidth={1.5} aria-hidden />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((line) => (
                      <tr
                        key={line.id}
                        className="border-b border-border/60 align-top transition-colors last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="text-white/75">{formatDateTime(line.createdAt) ?? "—"}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-white/35">{line.code}</p>
                        </td>
                        <td className="px-4 py-3">
                          {line.attendees.length > 0 ? (
                            <p className="flex items-start gap-1.5 text-white/80">
                              <Users className="mt-0.5 size-3.5 shrink-0 text-white/30" strokeWidth={1.5} aria-hidden />
                              <span className="min-w-0">
                                {attendeeLabels(line, questions).join(", ")}
                              </span>
                            </p>
                          ) : (
                            <span className="text-white/30">Sin nombre</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/60">{line.typeName || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-white/75">
                          {line.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={line.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <p className="font-semibold tabular-nums">{amountText(line)}</p>
                          {line.donationCents > 0 ? (
                            <p className="mt-0.5 text-[11px] tabular-nums text-white/40">
                              Aporte {formatCents(line.donationCents)}
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border-strong text-[13px] font-semibold">
                      <td className="px-4 py-3" colSpan={3}>
                        Total
                        {filtersActive ? (
                          <span className="ml-1.5 font-normal text-white/40">con filtros</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatNumber(totals.tickets)}</td>
                      <td />
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCents(totals.collectedCents)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </Card>

              {pageCount > 1 ? (
                <nav
                  aria-label="Páginas de pedidos"
                  className="flex items-center justify-between gap-3"
                >
                  <p className="text-[13px] tabular-nums text-white/45">
                    {pageStart + 1}–{pageStart + shown.length} de {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 0}
                      onClick={() => setPage(currentPage - 1)}
                      className={`inline-flex h-9 items-center gap-1 pl-2.5 pr-3.5 text-[13px] disabled:pointer-events-none disabled:opacity-40 ${glassCtaClass}`}
                    >
                      <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
                      Anterior
                    </button>
                    <span className="hidden text-[13px] tabular-nums text-white/45 sm:inline">
                      {currentPage + 1} / {pageCount}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= pageCount - 1}
                      onClick={() => setPage(currentPage + 1)}
                      className={`inline-flex h-9 items-center gap-1 pl-3.5 pr-2.5 text-[13px] disabled:pointer-events-none disabled:opacity-40 ${glassCtaClass}`}
                    >
                      Siguiente
                      <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
                    </button>
                  </div>
                </nav>
              ) : null}
            </>
          )}
        </div>
      )}
    </section>
  );
}
