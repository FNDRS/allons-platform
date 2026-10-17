import { Pencil, X } from "lucide-react";

/** One authored schedule or package: opens its editor, or removes it. */
export function ClassDraftRow({
  title,
  detail,
  aside,
  meta,
  note,
  editLabel,
  removeLabel,
  onEdit,
  onRemove,
  canRemove = true,
}: {
  title: string;
  detail: string;
  aside?: string;
  /** A second line that wraps instead of being cut, e.g. a sale window. */
  meta?: string | null;
  note?: string | null;
  editLabel: string;
  removeLabel: string;
  onEdit: () => void;
  onRemove: () => void;
  /** False hides the remove button, e.g. for a row that already has sales. */
  canRemove?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[18px] border border-border bg-surface pr-2 transition hover:border-border-strong">
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold tracking-tight">{title}</span>
          <span className="block truncate text-[13px] text-white/50">{detail}</span>
          {meta ? <span className="block text-[12px] leading-5 text-white/40">{meta}</span> : null}
          {note ? <span className="block text-[12px] font-semibold text-accent">{note}</span> : null}
        </span>
        {aside ? (
          <span className="shrink-0 text-[14px] font-semibold tabular-nums">{aside}</span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition hover:bg-white/10 hover:text-white"
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
