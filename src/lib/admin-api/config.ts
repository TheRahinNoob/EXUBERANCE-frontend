/**
 * ==================================================
 * ADMIN API CONFIG — SINGLE SOURCE OF TRUTH
 * ==================================================
 *
 * GUARANTEES:
 * - Django SessionAuthentication
 * - Cross-domain CSRF (Vercel → Render / Localhost)
 * - Race-safe CSRF initialization
 * - Backward compatible with existing admin API files
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
   DEFAULT FETCH OPTIONS (🔥 REQUIRED 🔥)
================================================== */

/**
 * ⚠️ DO NOT REMOVE
 * Many admin API modules depend on this export
 */
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: "include",
  cache: "no-store",
};

/* ==================================================
   CSRF BOOTSTRAP (RACE-SAFE)
================================================== */

let csrfInitPromise: Promise<void> | null = null;

async function fetchCSRF(): Promise<void> {
  await fetch(`${API_BASE}/api/csrf/`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
}

/**
 * Ensures CSRF cookie is set EXACTLY ONCE
 * All adminFetch() calls wait for this
 */
export function initCSRFOnce(): Promise<void> {
  if (!csrfInitPromise) {
    csrfInitPromise = fetchCSRF();
  }
  return csrfInitPromise;
}

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
   ADMIN FETCH (FINAL, SAFE)
================================================== */

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();

  // 🔐 Ensure CSRF cookie exists BEFORE mutation
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    await initCSRFOnce();
  }

  const headers = new Headers(init.headers || {});

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = readCSRFCookie();

    if (!csrfToken) {
      throw new Error(
        "[CSRF] csrftoken cookie missing even after initialization"
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
