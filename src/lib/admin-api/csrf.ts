// src/lib/admin-api/csrf.ts

/**
 * ==================================================
 * DJANGO CSRF — BOOTSTRAP ONLY
 * ==================================================
 *
 * PURPOSE:
 * - Forces Django to set `csrftoken` cookie
 * - MUST be called once when admin loads
 *
 * IMPORTANT:
 * - Does NOT read token
 * - Does NOT store token
 * - Browser handles cookies automatically
 */

import { API_BASE } from "./config";

let csrfInitialized = false;

export async function initCSRF(): Promise<void> {
  if (csrfInitialized) return;

  await fetch(`${API_BASE}/api/csrf/`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  csrfInitialized = true;
}
