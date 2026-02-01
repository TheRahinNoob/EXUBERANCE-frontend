/**
 * ==================================================
 * ADMIN API CONFIG — SINGLE SOURCE OF TRUTH
 * ==================================================
 *
 * PRODUCTION SAFE:
 * - Django SessionAuthentication
 * - Cross-domain CSRF (Vercel → Render)
 * - NO silent failures
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
   DEFAULT FETCH OPTIONS
================================================== */

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: "include",
  cache: "no-store",
};

/* ==================================================
   CSRF TOKEN (DIRECT, RELIABLE)
================================================== */

function readCSRFCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    /(^|;\s*)csrftoken=([^;]+)/
  );

  return match ? decodeURIComponent(match[2]) : null;
}

/* ==================================================
   ADMIN FETCH (🔥 FINAL FIX 🔥)
================================================== */

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();

  const headers = new Headers(init.headers || {});

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = readCSRFCookie();

    if (!csrfToken) {
      throw new Error(
        "[CSRF] Missing csrftoken cookie. Did /api/csrf/ run?"
      );
    }

    headers.set("X-CSRFToken", csrfToken);
  }

  return fetch(input, {
    ...DEFAULT_FETCH_OPTIONS,
    ...init,
    headers,
  });
}
