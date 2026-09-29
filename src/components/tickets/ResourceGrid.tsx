"use client";

import { StatusPill } from "@/components/ui/Pill";
import { layoutRows } from "@/lib/resourceLayout";

export interface ResourceTile {
  id: string;
  label: string;
  taken: boolean;
  mine?: boolean;
  /** Second line under the label, e.g. holder name (comercio view). */
  caption?: string | null;
  /** Cell on the map when the organizer drew one; otherwise the tile flows. */
  row?: number | null;
  col?: number | null;
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
  mark = null,
  square = false,
}: {
  tiles: ResourceTile[];
  columns?: number | null;
  onSelect?: (tile: ResourceTile) => void;
  disabled?: boolean;
  compact?: boolean;
  frontLabel?: string | null;
  /** Icono de la unidad: bici, mat, saco o trampolín. */
  mark?: StudioMark;
  /** Casilla cuadrada. La bici de spinning sigue alta. */
  square?: boolean;
}) {
  const { rows, cols } = layoutRows(tiles, columns, autoColumns(tiles.length));
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
          {row.map((tile, cellIndex) =>
            tile ? (
              <UnitTile
                key={tile.id}
                tile={tile}
                cols={cols}
                gap={gap}
                maxTile={maxTile}
                compact={compact}
                mark={mark}
                square={square}
                onSelect={onSelect}
                disabled={disabled}
              />
            ) : (
              <EmptyCell key={`gap-${rowIndex}-${cellIndex}`} cols={cols} gap={gap} maxTile={maxTile} square={square} />
            ),
          )}
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
  mark,
  square,
  onSelect,
  disabled,
}: {
  tile: ResourceTile;
  cols: number;
  gap: number;
  maxTile: number;
  compact: boolean;
  mark: StudioMark;
  square: boolean;
  onSelect?: (tile: ResourceTile) => void;
  disabled: boolean;
}) {
  const interactive = Boolean(onSelect) && !disabled && !(tile.taken && !tile.mine);
  const shape = square ? "aspect-square rounded-[12px]" : "aspect-[1/1.18] rounded-[16px]";
  const className = `flex w-full min-w-0 flex-col items-center justify-center overflow-hidden border text-center transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] select-none ${shape} ${
    tile.mine
      ? "border-accent bg-accent text-black shadow-[0_8px_30px_rgba(246,112,16,0.35)]"
      : tile.taken && tile.caption
        ? "border-accent bg-accent text-black shadow-[0_8px_30px_rgba(246,112,16,0.35)]"
        : tile.taken
          ? "border-transparent bg-white/[0.03] text-white/25"
          : "border-white/12 bg-white/[0.07] text-white hover:border-white/20 hover:bg-white/[0.12]"
  } ${interactive ? "cursor-pointer active:scale-95" : "cursor-default"}`;

  const content = (
    <>
      {mark ? <UnitMark mark={mark} className={compact ? "size-3.5" : "size-4"} /> : null}
      <span className={`font-bold leading-none ${compact ? "text-[11px]" : "text-[13px]"} ${mark ? (compact ? "mt-0.5" : "mt-1") : ""}`}>
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
    minWidth: 0,
  };

  if (!interactive) {
    return (
      <div
        className={className}
        style={style}
        role="img"
        aria-label={`${tile.label}${tile.caption ? `, ${tile.caption}` : ""}${tile.taken ? ", ocupada" : ""}`}
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

/** A gap in the drawn map: takes a tile's room, shows nothing. */
function EmptyCell({
  cols,
  gap,
  maxTile,
  square,
}: {
  cols: number;
  gap: number;
  maxTile: number;
  square: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`${square ? "aspect-square" : "aspect-[1/1.18]"} w-full min-w-0`}
      style={{ flex: `0 1 calc((100% - ${(cols - 1) * gap}px) / ${cols})`, maxWidth: maxTile, minWidth: 0 }}
    />
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

export type StudioMark = "bike" | "mat" | "bag" | "bounce" | null;

function UnitMark({ mark, className }: { mark: Exclude<StudioMark, null>; className: string }) {
  if (mark === "mat") return <MatMark className={className} />;
  if (mark === "bag") return <BagMark className={className} />;
  if (mark === "bounce") return <BounceMark className={className} />;
  return <BikeMark className={className} />;
}

function MatMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="3.5" y="6.5" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 11h17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BagMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M9.5 3.5h5M12 3.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="6" width="8" height="14.5" rx="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BounceMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <ellipse cx="12" cy="8" rx="7" ry="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.2 8.6 3.6 16.5M18.8 8.6 20.4 16.5M6.5 16.5h11M8 16.5v3M16 16.5v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function autoColumns(count: number) {
  if (count <= 0) return 7;
  if (count <= 7) return count;
  return 7;
}

/** Cómo se dibuja el mapa según el nombre de la unidad. */
export function studioMapChrome(name: string): {
  frontLabel: string | null;
  mark: StudioMark;
  square: boolean;
} {
  const n = name.toLowerCase();
  if (/(locker|casillero)/.test(n)) {
    return { frontLabel: null, mark: null, square: false };
  }
  if (/(saco|bolsa)/.test(n)) {
    return { frontLabel: "Frente estrado", mark: "bag", square: true };
  }
  if (/\bmat\b/.test(n)) {
    return { frontLabel: "Mat Coach", mark: "mat", square: true };
  }
  if (/\bbounce\b/.test(n)) {
    return { frontLabel: "Coach", mark: "bounce", square: true };
  }
  const bike = /(bici|bike)/.test(n);
  return { frontLabel: "Coach", mark: bike ? "bike" : null, square: false };
}

/** Frente del salón. Lockers no lo tienen; el saco mira al estrado. */
export function studioFrontLabel(name: string): string | null {
  return studioMapChrome(name).frontLabel;
}
