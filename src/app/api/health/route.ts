import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness for uptime monitors: up or down, nothing else. This used to echo
 * the Supabase URL, PostgREST response headers, the exposed tables and a
 * waitlist row (email, IP) to anyone who asked, so it now answers a status
 * and keeps the details in the server log.
 */
export async function GET() {
  try {
    const { error } = await getSupabaseAdmin()
      .from("waitlist")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[health] database check failed", err);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
