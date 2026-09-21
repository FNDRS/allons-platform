"use client";

import { StatusPill } from "@/components/ui/Pill";

export interface ResourceTile {
  id: string;
  label: string;
  taken: boolean;
  mine?: boolean;
  /** Second line under the label, e.g. holder name (comercio view). */
  caption?: string | null;
}

/**
 * Studio map shared by the attendee picker, the public preview and the
 * comercio map. Tiles keep a fixed max size so a wide card does not stretch
 * them into ovals; leftover seats on the last row stay centered.
 */
export function ResourceGrid({
  tiles,
  columns,
  onSelect,
  disabled = false,
  compact = false,
  frontLabel,
}: {
  tiles: ResourceTile[];
  columns?: number | null;
  onSelect?: (tile: ResourceTile) => void;
  disabled?: boolean;
  compact?: boolean;
  frontLabel?: string | null;
}) {
  const cols = Math.min(Math.max(columns ?? autoColumns(tiles.length), 1), 12);
  const rows = chunk(tiles, cols);
  const gap = compact ? 6 : 8;
  const maxTile = compact ? 72 : 80;

  return (
    <div className="flex w-full flex-col items-center" style={{ gap: gap + 4 }}>
      {frontLabel ? <StudioFront label={frontLabel} /> : null}
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex w-full justify-center"
          style={{ gap }}
        >
          {row.map((tile) => (
            <UnitTile
              key={tile.id}
              tile={tile}
              cols={cols}
              gap={gap}
              maxTile={maxTile}
              compact={compact}
              showBike={Boolean(frontLabel)}
              onSelect={onSelect}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function UnitTile({
  tile,
  cols,
  gap,
  maxTile,
  compact,
  showBike,
  onSelect,
  disabled,
}: {
  tile: ResourceTile;
  cols: number;
  gap: number;
  maxTile: number;
  compact: boolean;
  showBike: boolean;
  onSelect?: (tile: ResourceTile) => void;
  disabled: boolean;
}) {
  const interactive = Boolean(onSelect) && !disabled && !(tile.taken && !tile.mine);
  const className = `flex aspect-[1/1.18] w-full flex-col items-center justify-center rounded-[16px] border text-center transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] select-none ${
    tile.mine
      ? "border-accent bg-accent text-black shadow-[0_8px_30px_rgba(246,112,16,0.35)]"
      : tile.taken
        ? "border-transparent bg-white/[0.03] text-white/25"
        : "border-white/12 bg-white/[0.07] text-white hover:border-white/20 hover:bg-white/[0.12]"
  } ${interactive ? "cursor-pointer active:scale-95" : "cursor-default"}`;

  const content = (
    <>
      {showBike ? <BikeMark className={compact ? "size-3.5" : "size-4"} /> : null}
      <span className={`font-bold leading-none ${compact ? "text-[11px]" : "text-[13px]"} ${showBike ? (compact ? "mt-0.5" : "mt-1") : ""}`}>
        {tile.label}
      </span>
      {tile.caption && !compact ? (
        <span className="mt-0.5 max-w-[90%] truncate px-1 text-[10px] leading-tight opacity-80">
          {tile.caption}
        </span>
      ) : null}
    </>
  );

  const style = {
    flex: `0 1 calc((100% - ${(cols - 1) * gap}px) / ${cols})`,
    maxWidth: maxTile,
  };

  if (!interactive) {
    return (
      <div
        className={className}
        style={style}
        aria-label={`${tile.label}${tile.taken ? ", ocupada" : ""}`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => onSelect?.(tile)}
      aria-pressed={tile.mine}
      aria-label={`${tile.label}${tile.mine ? ", tuya" : ", libre"}`}
    >
      {content}
    </button>
  );
}

function StudioFront({ label }: { label: string }) {
  return (
    <div className="mb-1 flex w-full max-w-[min(100%,420px)] items-center gap-3">
      <span className="h-px flex-1 bg-white/10" aria-hidden />
      <StatusPill tone="glass">{label}</StatusPill>
      <span className="h-px flex-1 bg-white/10" aria-hidden />
    </div>
  );
}

function BikeMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="6.5" cy="16.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="16.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 16.5 10 9.5h5.5M10 9.5 12.2 16M12.2 16h5.3M14.2 9.5H17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function autoColumns(count: number) {
  if (count <= 0) return 7;
  if (count <= 7) return count;
  return 7;
}

/** Frente del salón. Lockers no tienen coach; bicis y asientos sí. */
export function studioFrontLabel(name: string): string | null {
  const n = name.toLowerCase();
  if (/(locker|casillero)/.test(n)) return null;
  return "Coach";
}
