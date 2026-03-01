import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type RouteContext =
  | { params: { reference?: string } }
  | { params: Promise<{ reference?: string }> };

/**
 * GET /api/orders/public/by-ref/[reference]
 * Proxies to Django: /api/orders/public/by-ref/<reference>/
 *
 * - Supports params being either object OR Promise (some Next/Turbopack builds)
 * - Forwards upstream status codes
 * - Returns JSON if possible, else raw text
 * - no-store cache to avoid stale totals
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const paramsAny: any = (context as any).params;
    const resolvedParams =
      typeof paramsAny?.then === "function" ? await paramsAny : paramsAny;

    const referenceRaw = (resolvedParams?.reference ?? "").toString();
    const reference = referenceRaw.trim();

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference parameter" },
        { status: 400 }
      );
    }

    const upstreamUrl = `${API_BASE.replace(/\/$/, "")}/api/orders/public/by-ref/${encodeURIComponent(
      reference
    )}/`;

    const upstreamRes = await fetch(upstreamUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const status = upstreamRes.status;
    const contentType = upstreamRes.headers.get("content-type") || "";
    const bodyText = await upstreamRes.text();

    // Prefer JSON when possible
    if (
      contentType.includes("application/json") ||
      contentType.includes("application/problem+json")
    ) {
      try {
        const json = bodyText ? JSON.parse(bodyText) : null;
        const res = NextResponse.json(json ?? {}, { status });
        res.headers.set("Cache-Control", "no-store");
        return res;
      } catch {
        // fall through to raw text
      }
    }

    const res = new NextResponse(bodyText, {
      status,
      headers: {
        "Content-Type": contentType || "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });

    return res;
  } catch (err) {
    console.error("[API] public/by-ref proxy error:", err);
    return NextResponse.json(
      { error: "Upstream unavailable", detail: "Failed to fetch order" },
      { status: 502 }
    );
  }
}