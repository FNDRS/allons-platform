import type { NextRequest } from "next/server";

/**
 * Best-effort fixed-window limiter, per instance. A serverless deploy runs
 * several instances, so this is a speed bump for one noisy client, not a
 * quota; the unique index on the table and Vercel's firewall do the rest.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
      if (buckets.size >= MAX_BUCKETS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    null
  );
}

/**
 * A state-changing request must come from a page on this site. Browsers set
 * `Origin` (and `Sec-Fetch-Site`) on every cross-origin POST and scripts on
 * another site cannot forge them, so a form on a third-party page cannot
 * submit on a visitor's behalf.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;
  // Scheme too, not only the host: `http://allonsapp.com` is another origin.
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    req.nextUrl.protocol.replace(/:$/, "");
  try {
    return new URL(origin).origin === new URL(`${proto}://${host}`).origin;
  } catch {
    return false;
  }
}
