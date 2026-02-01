// src/lib/admin-api/csrf.ts

/**
 * ==================================================
 * DJANGO CSRF — SINGLE SOURCE OF TRUTH
 * ==================================================
 *
 * RULES (NON-NEGOTIABLE):
 * - Django generates the token
 * - Browser stores it in `csrftoken` cookie
 * - We ONLY read from cookie
 * - We NEVER generate or cache tokens
 */

/* ==================================================
   INIT — SET CSRF COOKIE
================================================== */

import { API_BASE } from "./config";

/**
 * Call ONCE when admin app loads
 * This makes Django set `csrftoken` cookie
 */
export async function initCSRF(): Promise<void> {
  await fetch(`${API_BASE}/api/csrf/`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
}

/* ==================================================
   READ TOKEN — ALWAYS FROM COOKIE
================================================== */

/**
 * Returns the EXACT csrftoken Django issued
 * Used in POST / PATCH / DELETE requests
 */
export function getCSRFToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    /(^|;\s*)csrftoken=([^;]+)/
  );

  return match ? decodeURIComponent(match[2]) : null;
}
