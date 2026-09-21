const hnl = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  minimumFractionDigits: 2,
});

/** "L 1,250.00" from lempiras. */
export function formatHNL(lempiras: number): string {
  return hnl.format(Number.isFinite(lempiras) ? lempiras : 0);
}

/** "L 1,250.00" from cents. */
export function formatCents(cents: number | null | undefined): string {
  return formatHNL((cents ?? 0) / 100);
}

/** "Gratis" or the price. */
export function formatPriceCents(cents: number | null | undefined): string {
  if (!cents || cents <= 0) return "Gratis";
  return formatCents(cents);
}

export function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("es-HN", {
    timeZone: "America/Tegucigalpa",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatShortDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-HN", {
    timeZone: "America/Tegucigalpa",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-HN").format(value);
}

/** "dom 20 sept" for overlay cards. */
export function formatCardDay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const label = date.toLocaleDateString("es-HN", {
    timeZone: "America/Tegucigalpa",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return label.replace(/\./g, "");
}

/** "10:00 a. m." */
export function formatCardTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("es-HN", {
    timeZone: "America/Tegucigalpa",
    hour: "numeric",
    minute: "2-digit",
  });
}
