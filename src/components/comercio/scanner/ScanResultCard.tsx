"use client";

import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Repeat,
  ShieldOff,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ScanOutcome } from "@/hooks/useScanner";
import { formatClassDate, formatClassTime } from "@/lib/classFormat";
import { formatCardTime, formatRelativeTime } from "@/lib/format";

type Tone = "success" | "warn" | "danger" | "accent";

const TONE: Record<Tone, { ring: string; icon: string; soft: string }> = {
  success: { ring: "border-success/40", icon: "text-success", soft: "bg-success/10" },
  warn: { ring: "border-amber-300/40", icon: "text-amber-300", soft: "bg-amber-300/10" },
  danger: { ring: "border-danger/40", icon: "text-danger", soft: "bg-danger/10" },
  accent: { ring: "border-accent/40", icon: "text-accent", soft: "bg-accent/10" },
};

type View = {
  tone: Tone;
  Icon: LucideIcon;
  title: string;
  message?: string;
  name?: string;
  details?: string[];
};

function previousLine(previous?: { scannedAt: string; scannedByName: string }) {
  if (!previous) return undefined;
  const time = formatCardTime(previous.scannedAt);
  const when = formatRelativeTime(previous.scannedAt);
  return `Entró ${when}${time ? ` (${time})` : ""}, lo registró ${previous.scannedByName}.`;
}

function ticketDetails(result: {
  ticketType: string;
  ticketTitle: string;
  attendeeCount: number;
}) {
  const details = [result.ticketType];
  if (result.ticketTitle && result.ticketTitle !== result.ticketType) details.push(result.ticketTitle);
  if (result.attendeeCount > 1) details.push(`Válido para ${result.attendeeCount} personas`);
  return details;
}

function viewFor(outcome: ScanOutcome): View {
  switch (outcome.kind) {
    case "needs-event":
      return {
        tone: "accent",
        Icon: CircleAlert,
        title: "Elige un evento",
        message: "Selecciona el evento de la puerta antes de validar tickets.",
      };
    case "blocked":
      return { tone: "danger", Icon: ShieldOff, title: outcome.title, message: outcome.message };
    case "error":
      return { tone: "danger", Icon: CircleX, title: "No se pudo validar", message: outcome.message };
    case "class": {
      const r = outcome.result;
      const session =
        r.date && r.startTime
          ? `${formatClassDate(r.date)}, ${formatClassTime(r.startTime)}`
          : undefined;
      const details = [r.programTitle, session].filter((item): item is string => Boolean(item));
      const name = r.holderName ?? undefined;
      if (r.status === "valid") {
        return { tone: "success", Icon: CircleCheck, title: "Asistencia registrada", name, details };
      }
      if (r.status === "duplicate") {
        return {
          tone: "warn",
          Icon: TriangleAlert,
          title: "Reserva ya usada",
          message: r.checkedInAt ? `Entró ${formatRelativeTime(r.checkedInAt)}.` : undefined,
          name,
          details,
        };
      }
      if (r.status === "wrong_day") {
        return {
          tone: "accent",
          Icon: Repeat,
          title: "Reserva de otro día",
          message: "Esta reserva es para otra sesión de la clase.",
          name,
          details,
        };
      }
      if (r.status === "cancelled") {
        return { tone: "danger", Icon: CircleX, title: "Reserva cancelada", name, details };
      }
      return {
        tone: "danger",
        Icon: CircleX,
        title: "Código inválido",
        message: "No encontramos una reserva con este código.",
      };
    }
    case "preview":
    case "confirmed": {
      const r = outcome.result;
      const name = r.attendeeName;
      const details = ticketDetails(r);
      const status = r.status;
      if (status === "ready") {
        return { tone: "success", Icon: CircleCheck, title: "Listo para ingreso", name, details };
      }
      if (status === "valid") {
        return { tone: "success", Icon: CircleCheck, title: "Acceso permitido", name, details };
      }
      if (status === "duplicate") {
        return {
          tone: "warn",
          Icon: TriangleAlert,
          title: "Ticket ya usado",
          message: previousLine(r.previousScan),
          name,
          details,
        };
      }
      if (status === "wrong_event") {
        const other = outcome.kind === "preview" ? outcome.result.eventTitle : undefined;
        return {
          tone: "accent",
          Icon: Repeat,
          title: "Ticket de otro evento",
          message: other ? `Este ticket es para ${other}.` : "Este ticket es para otro evento.",
          name,
          details,
        };
      }
      if (status === "cancelled") {
        return { tone: "danger", Icon: CircleX, title: "Ticket cancelado", name, details };
      }
      return {
        tone: "danger",
        Icon: CircleX,
        title: "Ticket inválido",
        message: "No reconocimos este código. Revisa que esté bien escrito.",
      };
    }
  }
}

/**
 * What the door sees after a code: a big colored verdict, who it is, and
 * the one action that comes next.
 */
export function ScanResultCard({
  outcome,
  confirming,
  switchTo,
  onConfirm,
  onSwitch,
  onNext,
}: {
  outcome: ScanOutcome;
  confirming: boolean;
  /** Set when a wrong-event ticket belongs to another event this door can open. */
  switchTo?: string;
  onConfirm: () => void;
  onSwitch: () => void;
  onNext: () => void;
}) {
  const view = viewFor(outcome);
  const tone = TONE[view.tone];
  const ready = outcome.kind === "preview" && outcome.result.status === "ready";
  const manual = outcome.kind === "preview" && !outcome.result.verified && ready;

  return (
    <div
      role="status"
      aria-live="assertive"
      className={`surface border-2 p-5 sm:p-6 ${tone.ring}`}
    >
      <div className="flex items-start gap-4">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${tone.soft}`}>
          <view.Icon className={`size-6 ${tone.icon}`} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[22px] font-bold leading-tight tracking-tight">{view.title}</p>
          {view.name ? (
            <p className="mt-1 break-words text-[17px] font-semibold text-white/90">{view.name}</p>
          ) : null}
          {view.details && view.details.length > 0 ? (
            <p className="mt-1 text-[14px] text-muted">{view.details.join(" · ")}</p>
          ) : null}
          {view.message ? <p className="mt-2 text-[14px] text-muted">{view.message}</p> : null}
          {manual ? (
            <p className="mt-2 text-[12px] text-dim">
              Validado con el código escrito. Si puedes, revisa una identificación.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {ready ? (
          <>
            <Button size="lg" full loading={confirming} onClick={onConfirm} autoFocus>
              Confirmar ingreso
            </Button>
            <Button size="lg" variant="ghost" full onClick={onNext} disabled={confirming}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            {switchTo ? (
              <Button size="lg" variant="secondary" full onClick={onSwitch}>
                Cambiar a {switchTo}
              </Button>
            ) : null}
            <Button size="lg" variant={switchTo ? "ghost" : "white"} full onClick={onNext} autoFocus>
              Siguiente
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
