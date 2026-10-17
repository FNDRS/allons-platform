/**
 * Coordinates from a Google Maps link, or from a "lat, lng" pair typed by hand.
 *
 * The patterns are the same ones allons-admin and allons-mobile use
 * (`lib/googleMapsLink.ts` in both), so a link that pins correctly there pins
 * the same spot here. Change all three together.
 */

export type MapCoordinates = { latitude: number; longitude: number };

export const HONDURAS_BOUNDS = {
  minLatitude: 12.9,
  maxLatitude: 16.55,
  minLongitude: -89.4,
  maxLongitude: -83.1,
} as const;

export function isInsideHonduras({ latitude, longitude }: MapCoordinates) {
  return (
    latitude >= HONDURAS_BOUNDS.minLatitude &&
    latitude <= HONDURAS_BOUNDS.maxLatitude &&
    longitude >= HONDURAS_BOUNDS.minLongitude &&
    longitude <= HONDURAS_BOUNDS.maxLongitude
  );
}

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    // (0,0) is what a link without real coordinates gives back; never a place.
    !(latitude === 0 && longitude === 0)
  );
}

/**
 * By precision: `!3d!4d` is the place's exact pin, `q=`/`ll=` what the person
 * asked for, and `@` only the center of the map view.
 */
const COORDINATE_PATTERNS = [
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  /[?&](?:q|query|daddr|saddr|destination|center|ll|sll|mlat)=(?:loc:)?(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
  /geo:(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
  /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  /(?:^|[\s(])(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:[\s)]|$)/,
];

/** Share links from the Maps app are short and only resolve by following them. */
const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl", "g.co"]);

function hostOf(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isShortGoogleMapsLink(raw: string) {
  const host = hostOf(raw);
  return host !== null && SHORT_LINK_HOSTS.has(host);
}

/**
 * Coordinates from an expanded link, a `geo:` URI or a hand typed "lat, lng".
 * A short link gives null: it has to be followed first, on the server.
 */
export function parseGoogleMapsLink(raw: string): MapCoordinates | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // A place name with accents escapes the coordinates in the link. Try it raw
  // and decoded, since decodeURIComponent throws on a stray `%`.
  const candidates = [trimmed];
  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded !== trimmed) candidates.push(decoded);
  } catch {
    // Invalid escapes: the raw text is enough.
  }

  for (const pattern of COORDINATE_PATTERNS) {
    for (const candidate of candidates) {
      const match = candidate.match(pattern);
      if (!match) continue;
      const latitude = Number(match[1]);
      const longitude = Number(match[2]);
      if (isValidCoordinate(latitude, longitude)) {
        return { latitude, longitude };
      }
    }
  }

  return null;
}

export function googleMapsUrl({ latitude, longitude }: MapCoordinates) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function formatCoordinate(value: number) {
  return String(Number(value.toFixed(6)));
}
