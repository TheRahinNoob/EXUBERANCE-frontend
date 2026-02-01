/**
 * ==================================================
 * ADMIN API CONFIG — SINGLE SOURCE OF TRUTH
 * ==================================================
 */

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
   CSRF COOKIE READER
================================================== */

function readCSRFCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    /(^|;\s*)csrftoken=([^;]+)/
  );

  return match ? decodeURIComponent(match[2]) : null;
}

/* ==================================================
   ADMIN FETCH (PRODUCTION SAFE)
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
        "[CSRF] csrftoken cookie missing. initCSRF() was not executed."
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
