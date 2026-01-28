/**
 * ==================================================
 * ADMIN API — SERVER FETCH (NEXT.JS 16 SAFE)
 * ==================================================
 *
 * PURPOSE:
 * - Server-side authenticated fetch
 * - Preserve Django session cookies
 * - Fully Next.js 16 compliant
 *
 * GUARANTEES:
 * - No client hacks
 * - No implicit any
 * - No cookie loss
 */

import { cookies } from "next/headers";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function adminServerFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  // ✅ NEXT.JS 16: cookies() RETURNS A PROMISE
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((c: RequestCookie) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.headers ?? {}),
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Admin server fetch failed");
  }

  return res.json() as Promise<T>;
}
