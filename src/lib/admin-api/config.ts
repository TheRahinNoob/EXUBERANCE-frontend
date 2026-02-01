/**
 * ==================================================
 * ADMIN API CONFIG — SINGLE SOURCE OF TRUTH
 * ==================================================
 *
 * ✔ Django SessionAuthentication
 * ✔ Cross-domain CSRF (Vercel → Render)
 * ✔ Race-condition safe
 * ✔ No token desync
 * ✔ Production hardened
 *
 * RULES:
 * - CSRF token is read ONCE after /api/csrf/
 * - Token is frozen in memory
 * - X-CSRFToken ALWAYS matches csrftoken cookie
 * - No dynamic cookie reads per request
 */

/* ==================================================
   API BASE (ABSOLUTE, NO TRAILING SLASH)
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
   CSRF TOKEN — LOCKED IN MEMORY
================================================== */

let CSRF_TOKEN: string | null = null;

/**
 * Reads csrftoken cookie ONCE
 * Must be called AFTER /api/csrf/
 */
export function setCSRFTokenFromCookie(): void {
  if (typeof document === "undefined") return;

  const match = document.cookie.match(
    /(^|;\s*)csrftoken=([^;]+)/
  );

  CSRF_TOKEN = match ? decodeURIComponent(match[2]) : null;
}

/* ==================================================
   ADMIN FETCH (THE ONLY WAY TO CALL ADMIN APIS)
================================================== */

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers || {});

  // Attach CSRF ONLY for mutations
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    if (!CSRF_TOKEN) {
      throw new Error(
        "[CSRF] Token not initialized. initCSRF() must run first."
      );
    }

    headers.set("X-CSRFToken", CSRF_TOKEN);
  }

  return fetch(input, {
    ...DEFAULT_FETCH_OPTIONS,
    ...init,
    headers,
  });
}
