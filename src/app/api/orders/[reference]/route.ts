import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest, { params }: { params: { reference: string } }) {
  const { reference } = params;
  try {
    const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(reference)}`);
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
