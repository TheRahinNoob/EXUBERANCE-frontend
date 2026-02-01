/**
 * ==================================================
 * ADMIN API CONFIG — JWT BASED (FINAL)
 * ==================================================
 */

import { getAccessToken } from "@/lib/admin-auth/token";

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL;

if (!RAW_API_BASE) {
  throw new Error(
    "[API_BASE] Missing NEXT_PUBLIC_API_BASE_URL"
  );
}

export const API_BASE = RAW_API_BASE.replace(/\/$/, "");

/* ==================================================
   ADMIN FETCH (JWT)
================================================== */

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  // ✅ CRITICAL FIX:
  // Only set JSON content-type when body is NOT FormData
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });
}
