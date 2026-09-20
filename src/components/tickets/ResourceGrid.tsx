"use client";

export interface ResourceTile {
  id: string;
  label: string;
  taken: boolean;
  mine?: boolean;
  /** Second line under the label, e.g. holder name (comercio view). */
  caption?: string | null;
}

/**
 * The unit map: a grid of round tiles. Shared by the attendee picker, the
 * public preview and the comercio map so all three read the same.
 */
export function ResourceGrid({
  tiles,
  columns,
  onSelect,
  disabled = false,
  compact = false,
}: {
  tiles: ResourceTile[];
  columns?: number | null;
  onSelect?: (tile: ResourceTile) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const cols = Math.min(Math.max(columns ?? autoColumns(tiles.length), 2), 12);
  return (
    <div
      className="grid gap-2.5 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {tiles.map((tile) => {
        const interactive = Boolean(onSelect) && !disabled;
        const className = `flex aspect-square flex-col items-center justify-center rounded-full border text-center transition select-none ${
          tile.mine
            ? "border-accent bg-accent text-black shadow-[0_10px_30px_rgba(246,112,16,0.35)]"
            : tile.taken
              ? "border-white/[0.06] bg-white/[0.03] text-white/25"
              : "border-white/[0.14] bg-white/[0.08] text-white hover:bg-white/[0.14]"
        } ${interactive ? "cursor-pointer active:scale-95" : "cursor-default"}`;
        const content = (
          <>
            <span
              className={`font-bold leading-none ${compact ? "text-[11px]" : "text-sm sm:text-base"}`}
            >
              {tile.label}
            </span>
            {tile.caption && !compact ? (
              <span className="mt-0.5 max-w-[90%] truncate px-1 text-[10px] leading-tight opacity-80">
                {tile.caption}
              </span>
            ) : null}
          </>
        );
        if (!interactive) {
          return (
            <div key={tile.id} className={className} aria-label={tile.label}>
              {content}
            </div>
          );
        }
        return (
          <button
            key={tile.id}
            type="button"
            className={className}
            onClick={() => onSelect?.(tile)}
            aria-pressed={tile.mine}
            aria-label={`${tile.label}${tile.taken && !tile.mine ? " (ocupada)" : ""}`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

function autoColumns(count: number) {
  if (count <= 6) return count || 1;
  if (count <= 16) return 4;
  if (count <= 30) return 6;
  return 8;
}
