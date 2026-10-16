/**
 * Direct donation details shown on an event page, for organizers that take
 * deposits outside Allons. Keyed by event id. The money never goes through
 * us: the page only lists where to send it.
 */
export type DonationAccount = {
  bank: string;
  hnl?: string;
  usd?: string;
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

export function donationInfoForEvent(eventId: string): EventDonationInfo | null {
  return BY_EVENT[eventId] ?? null;
}
