const hnlAmount = new Intl.NumberFormat("es-HN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "HNL 1,250.00" from lempiras. */
export function formatHNL(lempiras: number): string {
  const amount = Number.isFinite(lempiras) ? lempiras : 0;
  return `HNL ${hnlAmount.format(amount)}`;
}

/** "HNL 1,250.00". Same code as the rest of the product. */
export function formatDashboardHNL(lempiras: number): string {
  return formatHNL(lempiras);
}

/** "HNL 1,250.00" from cents. */
export function formatCents(cents: number | null | undefined): string {
  return formatHNL((cents ?? 0) / 100);
}

/** "Gratis" or the price. */
export function formatPriceCents(cents: number | null | undefined): string {
  if (!cents || cents <= 0) return "Gratis";
  return formatCents(cents);
}

/** "HNL 500" on a card. Whole lempiras drop the cents. */
export function formatCardPrice(cents: number | null | undefined): string {
  if (!cents || cents <= 0) return "Gratis";
  const lempiras = cents / 100;
  const whole = Number.isInteger(lempiras);
  return `HNL ${lempiras.toLocaleString("es-HN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
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

/** "ahora", "hace 5 min", "hace 3 h", then the short date. */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return "ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return formatShortDate(iso) ?? "";
}
