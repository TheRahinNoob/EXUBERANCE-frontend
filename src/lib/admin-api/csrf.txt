// src/lib/admin-api/csrf.ts

/**
 * ==================================================
 * DJANGO CSRF — BOOTSTRAP (FINAL)
 * ==================================================
 *
 * PURPOSE:
 * - Triggers Django to set csrftoken cookie
 * - Immediately locks that token into memory
 *
 * REQUIRED FOR:
 * - Cross-domain session auth (Vercel → Render)
 */

import {
  API_BASE,
  setCSRFTokenFromCookie,
} from "./config";

/**
 * Call ONCE when admin app loads
 */
export async function initCSRF(): Promise<void> {
  await fetch(`${API_BASE}/api/csrf/`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  // 🔥 THIS WAS MISSING — AND THIS IS THE FIX
  setCSRFTokenFromCookie();
}
