// src/lib/admin-api/config.ts

/**
 * ==================================================
 * ADMIN API CONFIG — FINAL, RACE-SAFE
 * ==================================================
 */

let CSRF_TOKEN: string | null = null;
let CSRF_READY: Promise<void> | null = null;

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
   CSRF INITIALIZATION (SINGLETON)
================================================== */

export function initCSRFOnce(): Promise<void> {
  if (CSRF_READY) return CSRF_READY;

  CSRF_READY = (async () => {
    await fetch(`${API_BASE}/api/csrf/`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const match = document.cookie.match(
      /(?:^|;\s*)csrftoken=([^;]+)/
    );

    if (!match) {
      throw new Error(
        "[CSRF] csrftoken cookie missing after /api/csrf/"
      );
    }

    CSRF_TOKEN = decodeURIComponent(match[1]);
  })();

  return CSRF_READY;
}

/* ==================================================
   ADMIN FETCH (RACE-SAFE)
================================================== */

export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    await initCSRFOnce();

    if (!CSRF_TOKEN) {
      throw new Error(
        "[CSRF] Token unavailable after init"
      );
    }
  }

  const headers = new Headers(init.headers || {});

  if (CSRF_TOKEN) {
    headers.set("X-CSRFToken", CSRF_TOKEN);
  }

  return fetch(input, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers,
  });
}
