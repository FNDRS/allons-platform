/**
 * Lay a group's units out as rows of cells for the studio map.
 *
 * Units carrying a cell (row, col) sit exactly there and the cells nobody
 * points at stay empty, which is how a sketch like "one spot up front, then
 * three rows of three" is drawn. Units without a cell flow in order below,
 * `columns` per row, as the map worked before cells existed.
 */
export interface Placeable {
  row?: number | null;
  col?: number | null;
}

export const MAX_MAP_COLUMNS = 12;

export function layoutRows<T extends Placeable>(
  items: T[],
  columns: number | null | undefined,
  fallbackColumns: number,
): { rows: Array<Array<T | null>>; cols: number } {
  const placed = items.filter(hasCell);
  const flowing = items.filter((item) => !hasCell(item));
  const requested = Number(columns);
  const wanted = Number.isFinite(requested) && requested >= 1 ? Math.floor(requested) : 0;

  if (placed.length === 0) {
    const cols = clampCols(wanted || fallbackColumns);
    return { rows: chunk(flowing, cols), cols };
  }

  const maxCol = Math.max(...placed.map((item) => item.col as number));
  const maxRow = Math.max(...placed.map((item) => item.row as number));
  const cols = clampCols(Math.max(wanted, maxCol + 1));
  const rows: Array<Array<T | null>> = Array.from({ length: maxRow + 1 }, () =>
    Array.from({ length: cols }, () => null),
  );
  for (const item of placed) {
    const row = item.row as number;
    const col = item.col as number;
    if (col < cols) rows[row][col] = item;
  }
  // A unit added by hand after the map was drawn has no cell yet; it goes
  // under the map instead of vanishing.
  for (const row of chunk(flowing, cols)) rows.push(row);
  return { rows, cols };
}

function hasCell(item: Placeable): boolean {
  return (
    typeof item.row === "number" &&
    typeof item.col === "number" &&
    item.row >= 0 &&
    item.col >= 0
  );
}

function clampCols(cols: number): number {
  return Math.min(Math.max(cols, 1), MAX_MAP_COLUMNS);
}

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return items.length ? [items] : [];
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}
