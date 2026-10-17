/**
 * Direct donation details shown on an event page and on the comercio's
 * profile, for organizers that take deposits outside Allons. Keyed by event
 * id and by comercio id (not handle: a handle can be renamed). The money
 * never goes through us: the page only lists where to send it.
 *
 * Events and comercios now carry this from the API (`EventDetail.donationInfo`
 * and `ComercioProfile.donationInfo`, set in the admin or, for events, in the
 * comercio portal). The maps below are only the fallback until that data is
 * backfilled.
 */
export type DonationAccount = {
  bank: string;
  hnl?: string | null;
  usd?: string | null;
};

export type DonationLink = {
  label: string;
  value: string;
  href: string;
};

export type EventDonationInfo = {
  /** Who receives the deposit, e.g. "FUNHOCAM". */
  beneficiary: string;
  accounts: DonationAccount[];
  links: DonationLink[];
  /** Free text under the accounts, e.g. that cash is taken at the venue. */
  note?: string | null;
};

/** Same limits the API checks (`parseEventDonationInfo`). */
export const DONATION_LIMITS = {
  beneficiary: 120,
  bank: 80,
  accountNumber: 40,
  label: 40,
  value: 80,
  href: 300,
  note: 280,
  accounts: 8,
  links: 6,
} as const;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object",
      )
    : [];
}

/**
 * Trims every string and drops rows left blank, as the API does. Nothing
 * filled in comes back as null, the same thing the switch turned off sends.
 */
export function normalizeDonationInfo(value: unknown): EventDonationInfo | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const beneficiary = text(body.beneficiary);
  const accounts = rows(body.accounts)
    .map((row) => ({
      bank: text(row.bank),
      hnl: text(row.hnl) || null,
      usd: text(row.usd) || null,
    }))
    .filter((row) => row.bank || row.hnl || row.usd);
  const links = rows(body.links)
    .map((row) => ({ label: text(row.label), value: text(row.value), href: text(row.href) }))
    .filter((row) => row.label || row.value || row.href);
  const note = text(body.note) || null;

  if (!beneficiary && accounts.length === 0 && links.length === 0 && !note) return null;
  return { beneficiary, accounts, links, note };
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * What the API would refuse in normalized donation info, phrased to follow
 * "falta ..." in the form's save hints. Empty when it can be saved.
 */
export function donationInfoProblems(info: EventDonationInfo | null): string[] {
  if (!info) return ["el beneficiario de las donaciones"];
  const problems: string[] = [];
  if (!info.beneficiary) problems.push("el beneficiario de las donaciones");
  if (info.accounts.length > DONATION_LIMITS.accounts) {
    problems.push(`dejar como máximo ${DONATION_LIMITS.accounts} cuentas para donar`);
  }
  if (info.links.length > DONATION_LIMITS.links) {
    problems.push(`dejar como máximo ${DONATION_LIMITS.links} enlaces para donar`);
  }
  for (const account of info.accounts) {
    if (!account.bank) {
      problems.push("el banco de cada cuenta para donar");
    } else if (!account.hnl && !account.usd) {
      problems.push(`un número de cuenta en lempiras o dólares para ${account.bank}`);
    }
  }
  for (const link of info.links) {
    if (!link.label || !link.value || !link.href) {
      problems.push("etiqueta, texto y URL en cada enlace para donar");
    } else if (!isHttpsUrl(link.href)) {
      problems.push(`una URL que empiece con https:// en "${link.label}"`);
    }
  }
  return [...new Set(problems)];
}

const FUNHOCAM: EventDonationInfo = {
  beneficiary: "FUNHOCAM",
  accounts: [
    { bank: "Banco Atlántida", hnl: "1203147044", usd: "1203147010" },
    { bank: "Banco Ficensa", hnl: "1-20-8044-6" },
    { bank: "Banco Promerica", hnl: "8-446141" },
    { bank: "BAC Credomatic", hnl: "721-357-871" },
  ],
  links: [
    { label: "Sitio web", value: "funhocam.org", href: "https://www.funhocam.org" },
    { label: "Instagram", value: "@funhocamhn", href: "https://www.instagram.com/funhocamhn" },
    { label: "Facebook", value: "FUNHOCAM", href: "https://www.facebook.com/FUNHOCAM" },
    { label: "TikTok", value: "@funhocam", href: "https://www.tiktok.com/@funhocam" },
  ],
};

const BY_EVENT: Record<string, EventDonationInfo> = {
  "a0367900-2a14-4ff0-bb9a-c2afc29e152f": FUNHOCAM,
};

const BY_COMERCIO: Record<string, EventDonationInfo> = {
  "d2f084fe-efe1-411d-b08c-d102687f29ee": FUNHOCAM,
};

export function donationInfoForEvent(eventId: string): EventDonationInfo | null {
  return BY_EVENT[eventId] ?? null;
}

export function donationInfoForComercio(comercioId: string): EventDonationInfo | null {
  return BY_COMERCIO[comercioId] ?? null;
}
