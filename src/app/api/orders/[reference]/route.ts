import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * GET /api/orders/[reference]
 * ✅ Next.js 16+ App Router type-safe
 * ✅ Handles SSR
 * ✅ Works with Promise-wrapped params
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    // Next.js expects params to be a Promise here
    const { reference } = await context.params;

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference parameter" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${API_BASE}/api/orders/${encodeURIComponent(reference)}`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[API] GET /orders/[reference] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
