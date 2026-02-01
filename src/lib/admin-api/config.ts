/**
 * ==================================================
 * ADMIN API CONFIG — JWT ONLY (PRODUCTION SAFE)
 * ==================================================
 *
 * RULES:
 * - NO CSRF
 * - NO cookies
 * - Authorization: Bearer <access_token>
 * - Works cross-domain (Vercel ↔ Render)
 */

/* ==================================================
   API BASE
================================================== */

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
   TOKEN UTIL
================================================== */

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_access_token");
}

/* ==================================================
   DEFAULT FETCH OPTIONS
================================================== */

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

/* ==================================================
   ADMIN FETCH (JWT)
================================================== */

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});

  const token = getAccessToken();
  if (!token) {
    throw new Error(
      "[AUTH] Missing admin access token. Login required."
    );
  }

  headers.set("Authorization", `Bearer ${token}`);

  // Auto JSON content-type (except FormData)
  if (
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...DEFAULT_FETCH_OPTIONS,
    ...init,
    headers,
  });
}
