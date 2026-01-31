/**
 * ==================================================
 * ADMIN API CONFIG — SINGLE SOURCE OF TRUTH
 * ==================================================
 *
 * PURPOSE:
 * - Define ONE absolute API base URL
 * - Work in BOTH client and server environments
 * - Support Django session auth + CSRF
 *
 * NON-NEGOTIABLE RULES:
 * - NO hardcoded URLs
 * - NO silent fallbacks
 * - Server fetches MUST use absolute URLs
 * - Admin data must NEVER be cached
 */

/* ==================================================
   API BASE RESOLUTION (STRICT)
================================================== */

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL;

if (!RAW_API_BASE) {
  throw new Error(
    "[API_BASE] Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL (and API_BASE_URL for server)."
  );
}

if (!/^https?:\/\//i.test(RAW_API_BASE)) {
  throw new Error(
    `[API_BASE] Invalid API base URL (must include http/https): ${RAW_API_BASE}`
  );
}

/**
 * Absolute API base
 * - No trailing slash
 * - Example: https://api.fabrilife.com
 */
export const API_BASE: string =
  RAW_API_BASE.replace(/\/$/, "");

/* ==================================================
   DEFAULT ADMIN FETCH OPTIONS
================================================== */

/**
 * Mandatory defaults for ALL admin API calls
 *
 * - credentials: "include"
 *   → Django session auth
 *   → CSRF cookie support
 *
 * - cache: "no-store"
 *   → Admin data must NEVER be stale
 */
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: "include",
  cache: "no-store",
};
