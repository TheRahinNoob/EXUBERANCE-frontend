// src/lib/admin-api/csrf.ts

/**
 * ==================================================
 * CSRF COOKIE INITIALIZER (DJANGO)
 * ==================================================
 *
 * PURPOSE:
 * - Triggers Django to set the `csrftoken` cookie
 * - REQUIRED for session-based admin APIs
 *
 * HOW IT WORKS:
 * - Calls backend `/api/csrf/`
 * - Backend responds with Set-Cookie: csrftoken=...
 * - Browser stores cookie automatically
 *
 * IMPORTANT:
 * - This function DOES NOT return the token
 * - This function MUST be called once on admin load
 * ==================================================
 */

import { API_BASE } from "./config";

export async function initCSRF(): Promise<void> {
  await fetch(`${API_BASE}/api/csrf/`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
}
