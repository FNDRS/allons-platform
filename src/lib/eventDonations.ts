/**
 * Direct donation details shown on an event page and on the comercio's
 * profile, for organizers that take deposits outside Allons. Keyed by event
 * id and by comercio id (not handle: a handle can be renamed). The money
 * never goes through us: the page only lists where to send it.
 *
 * Events and comercios now carry this from the API (`EventDetail.donationInfo`
 * and `ComercioProfile.donationInfo`, set in the admin). The maps below are
 * only the fallback until that data is backfilled.
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
