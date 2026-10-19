"use client";

import { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { Label } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { SmoothInput } from "@/components/ui/SmoothInput";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { Stat } from "@/components/ui/Stat";
import { useScanner } from "@/hooks/useScanner";
import type { ProviderScanRecord, ScanStatus } from "@/lib/api/scans";
import { formatCardDay, formatCardTime, formatNumber, formatRelativeTime } from "@/lib/format";
import { CameraScanner, canUseCamera } from "./CameraScanner";
import { ScanResultCard } from "./ScanResultCard";

type Mode = "manual" | "camera";

const RECORD_LABEL: Record<ScanStatus, { label: string; className: string }> = {
  valid: { label: "Ingresó", className: "text-success" },
  duplicate: { label: "Repetido", className: "text-amber-300" },
  invalid: { label: "Inválido", className: "text-danger" },
  wrong_event: { label: "Otro evento", className: "text-accent" },
  cancelled: { label: "Cancelado", className: "text-danger" },
};

function eventLabel(event: { title: string; startsAt: string | null }) {
  const day = formatCardDay(event.startsAt);
  return day ? `${event.title} · ${day}` : event.title;
}

/**
 * Door check-in for the web. Typing the code is the main path, since most
 * of the door staff work from a laptop or an Android phone; the camera is
 * offered wherever the browser can open one. A USB barcode reader also
 * works: it types into the code field and presses Enter.
 */
export function ScannerView() {
  const scanner = useScanner();
  const [mode, setMode] = useState<Mode>("manual");
  const [cameraReady, setCameraReady] = useState(false);
  const [code, setCode] = useState("");
  const lastRaw = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Read after mount: the server has no camera to ask about.
  useEffect(() => setCameraReady(canUseCamera()), []);

  const { outcome } = scanner;
  const showingResult = outcome !== null;

  const submit = (raw: string) => {
    lastRaw.current = raw;
    scanner.submit(raw);
  };

  const next = () => {
    scanner.reset();
    setCode("");
    if (mode === "manual") requestAnimationFrame(() => inputRef.current?.focus());
  };

  const wrongEventId =
    outcome?.kind === "preview" && outcome.result.status === "wrong_event"
      ? outcome.result.eventId
      : null;
  const switchEvent = wrongEventId
    ? scanner.events.find((event) => event.id === wrongEventId)
    : undefined;

  if (scanner.eventsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (scanner.eventsError) {
    return (
      <ErrorState
        message={scanner.eventsError.message}
        onRetry={() => void scanner.refetchEvents()}
      />
    );
  }
  if (scanner.events.length === 0) {
    return (
      <EmptyState
        title="No hay eventos para escanear"
        body="Cuando un evento esté publicado, aparecerá aquí para validar sus tickets."
      />
    );
  }

  const { event } = scanner;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div>
          <Label>Evento</Label>
          <Combobox
            value={event?.id ?? ""}
            onChange={(id) => {
              scanner.selectEvent(id);
              setCode("");
            }}
            options={scanner.events.map((item) => ({ value: item.id, label: eventLabel(item) }))}
            placeholder="Elige el evento"
            searchPlaceholder="Buscar evento"
            aria-label="Evento"
          />
        </div>

        {cameraReady ? (
          <Segmented<Mode>
            label="Forma de validar"
            value={mode}
            onChange={(value) => {
              setMode(value);
              scanner.reset();
            }}
            options={[
              { value: "manual", label: "Código" },
              { value: "camera", label: "Cámara" },
            ]}
          />
        ) : null}

        {mode === "camera" && cameraReady ? (
          <CameraScanner paused={showingResult || scanner.busy} onDetect={submit} />
        ) : (
          <Card padding="md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(code);
              }}
            >
              <Label htmlFor="ticket-code" hint="Lo ve el asistente debajo de su QR">
                Código del ticket
              </Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <SmoothInput
                  id="ticket-code"
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ALL-XXXXXX"
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  autoFocus
                  disabled={scanner.busy}
                  className="h-14 text-[20px] font-bold tracking-[0.12em]"
                  wrapperClassName="flex-1"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 sm:w-36"
                  loading={scanner.checking}
                  disabled={!code.trim()}
                >
                  Validar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {outcome ? (
          <ScanResultCard
            outcome={outcome}
            confirming={scanner.confirming}
            switchTo={switchEvent?.title}
            onConfirm={scanner.confirmEntry}
            onSwitch={() => {
              if (switchEvent) scanner.switchAndRetry(switchEvent.id, lastRaw.current);
            }}
            onNext={next}
          />
        ) : null}
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        {event ? (
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Ingresaron" value={formatNumber(event.scans)} />
            <Stat label="Vendidos" value={formatNumber(event.ticketsSold)} />
          </div>
        ) : null}
        <Card padding="md">
          <SectionTitle>Últimos ingresos</SectionTitle>
          <RecentScans records={scanner.records} loading={scanner.recordsLoading} />
        </Card>
      </aside>
    </div>
  );
}

function RecentScans({
  records,
  loading,
}: {
  records: ProviderScanRecord[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    );
  }
  if (records.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-dim">
        <ScanLine className="size-4" aria-hidden />
        Todavía no hay ingresos en este evento.
      </p>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-border">
      {records.slice(0, 10).map((record) => {
        const status = RECORD_LABEL[record.status] ?? RECORD_LABEL.invalid;
        return (
          <li key={record.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{record.attendeeName}</p>
              <p className="truncate text-[12px] text-dim">
                {record.ticketType} · {formatCardTime(record.scannedAt) ?? formatRelativeTime(record.scannedAt)}
              </p>
            </div>
            <span className={`shrink-0 text-[12px] font-semibold ${status.className}`}>
              {status.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
