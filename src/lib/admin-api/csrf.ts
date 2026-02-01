// src/lib/admin-api/csrf.ts

/**
 * ==================================================
 * DJANGO CSRF — BOOTSTRAP ONLY
 * ==================================================
 *
 * PURPOSE:
 * - Forces Django to SET the `csrftoken` cookie
 * - This file NEVER reads the token
 *
 * SINGLE SOURCE OF TRUTH:
 * - Reading + attaching CSRF token happens in `config.ts`
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
