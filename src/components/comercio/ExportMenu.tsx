"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Braces,
  ClipboardCopy,
  Download,
  FileSpreadsheet,
  FileText,
  Sheet,
} from "lucide-react";
import type { ExportFormat } from "@/lib/export/table";
import { glassCtaClass } from "@/components/ui/cta";
import { useDismiss } from "@/components/ui/useDismiss";

const EXPORT_OPTIONS: {
  format: ExportFormat | "copy";
  label: string;
  hint: string;
  icon: typeof FileText;
}[] = [
  { format: "pdf", label: "PDF", hint: "Para imprimir o compartir", icon: FileText },
  { format: "xlsx", label: "Excel", hint: ".xlsx con filtros", icon: FileSpreadsheet },
  { format: "csv", label: "CSV", hint: "Google Sheets, Numbers", icon: Sheet },
  { format: "json", label: "JSON", hint: "Para integraciones", icon: Braces },
  { format: "copy", label: "Copiar tabla", hint: "Pegar en una hoja de cálculo", icon: ClipboardCopy },
];

/** The "Exportar" button and its format menu, shared by the event's tables. */
export function ExportMenu({
  count,
  caption,
  onExport,
}: {
  count: number;
  /** Line on top of the menu, e.g. "12 pedidos con los filtros actuales". */
  caption: string;
  onExport: (format: ExportFormat | "copy") => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | "copy" | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  async function run(format: ExportFormat | "copy") {
    setBusy(format);
    try {
      await onExport(format);
      setOpen(false);
    } catch (error) {
      toast.error((error as Error).message || "No se pudo exportar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={count === 0}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-9 items-center gap-1.5 px-3.5 text-[13px] disabled:opacity-50 ${glassCtaClass}`}
      >
        <Download className="size-3.5" strokeWidth={1.5} aria-hidden />
        Exportar
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[260px] overflow-hidden rounded-[16px] border border-border-strong bg-[#0c0c0e] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
        >
          <p className="px-3 pb-1.5 pt-2 text-[11px] text-white/40">{caption}</p>
          {EXPORT_OPTIONS.map(({ format, label, hint, icon: Icon }) => (
            <button
              key={format}
              type="button"
              role="menuitem"
              disabled={busy !== null}
              onClick={() => void run(format)}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.08] disabled:opacity-50"
            >
              <Icon className="size-4 shrink-0 text-white/50" strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-white">
                  {busy === format ? "Generando…" : label}
                </span>
                <span className="block text-[12px] text-white/40">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
