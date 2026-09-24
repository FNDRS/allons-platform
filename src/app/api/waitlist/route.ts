import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { WAITLIST_BASE_SUBSCRIBERS } from "@/lib/waitlist-count";
import { getWaitlistTotals } from "@/lib/waitlist-count.server";
import { clientIp, isSameOrigin, rateLimit } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_RE = /^[a-z0-9][a-z0-9-_]{0,39}$/i;
/** An optional leading +, then digits with spaces, dashes or parentheses. */
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;
/** Formatting alone is not a number: 7 to 15 digits (E.164 max). */
function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "").length;
  return PHONE_RE.test(value) && digits >= 7 && digits <= 15;
}
const MAX_EMAIL_LENGTH = 254;
const MAX_BODY_BYTES = 2_048;
/** Two posts per signup (email, then phone); room for typos, not for a bot. */
const RATE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

export async function GET() {
  try {
    const totals = await getWaitlistTotals();
    return NextResponse.json({
      count: totals.dbCount,
      totalSubscribers: totals.totalSubscribers,
    });
  } catch (err) {
    console.error("[waitlist] count error", err);
    return NextResponse.json({
      count: 0,
      totalSubscribers: WAITLIST_BASE_SUBSCRIBERS,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const ip = clientIp(req);
    if (!rateLimit(`waitlist:${ip ?? "unknown"}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera unos minutos." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    }

    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 415 });
    }

    const tooLarge = () =>
      NextResponse.json({ error: "Payload too large" }, { status: 413 });
    // Refuse on the declared size before reading anything.
    if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
      return tooLarge();
    }

    let body: { email?: unknown; phone?: unknown; source?: unknown };
    try {
      // Bytes, not UTF-16 units: "ñ" or an emoji is more than one byte.
      const bytes = await req.arrayBuffer();
      if (bytes.byteLength > MAX_BODY_BYTES) return tooLarge();
      const raw = new TextDecoder().decode(bytes);
      body = JSON.parse(raw);
      if (!body || typeof body !== "object") throw new Error("not an object");
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }

    const rawSource = typeof body.source === "string" ? body.source.trim() : "";
    const source = rawSource && SOURCE_RE.test(rawSource) ? rawSource.toLowerCase() : null;

    const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (rawPhone && !isValidPhone(rawPhone)) {
      return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
    }
    const phone = rawPhone || null;

    const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;
    const referer = req.headers.get("referer")?.slice(0, 500) ?? null;

    const supabase = getSupabaseAdmin();
    const row: Record<string, unknown> = { email, source, user_agent: userAgent, referer, ip };
    if (phone) row.phone = phone;
    const { error } = await supabase.from("waitlist").insert(row as never);

    if (error) {
      if (error.code === "23505") {
        // The form posts the email first and the phone second, so a known
        // email may gain a phone. It never replaces one: otherwise anyone who
        // knows an address could overwrite the number stored for it.
        if (phone) {
          const { error: updateError } = await supabase
            .from("waitlist")
            .update({ phone } as never)
            .eq("email", email)
            .is("phone", null);
          if (updateError) {
            console.error("[waitlist] phone update error", updateError);
          }
        }
        try {
          const totals = await getWaitlistTotals();
          return NextResponse.json({
            ok: true,
            duplicate: true,
            count: totals.dbCount,
            totalSubscribers: totals.totalSubscribers,
          });
        } catch (countErr) {
          console.error("[waitlist] duplicate count error", countErr);
          return NextResponse.json({
            ok: true,
            duplicate: true,
            count: 0,
            totalSubscribers: WAITLIST_BASE_SUBSCRIBERS,
          });
        }
      }
      console.error("[waitlist] insert error", error);
      return NextResponse.json(
        {
          error: "No se pudo registrar. Inténtalo de nuevo.",
          ...(process.env.NODE_ENV !== "production"
            ? {
                code: error.code,
                message: error.message,
                details: (error as unknown as { details?: string }).details,
                hint: (error as unknown as { hint?: string }).hint,
              }
            : {}),
        },
        { status: 500 },
      );
    }

    try {
      const totals = await getWaitlistTotals();
      return NextResponse.json({
        ok: true,
        count: totals.dbCount,
        totalSubscribers: totals.totalSubscribers,
      });
    } catch (countErr) {
      console.error("[waitlist] post count error", countErr);
      return NextResponse.json({
        ok: true,
        count: 0,
        totalSubscribers: WAITLIST_BASE_SUBSCRIBERS,
      });
    }
  } catch (err) {
    console.error("[waitlist] unexpected error", err);
    return NextResponse.json(
      { error: "No se pudo registrar. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
