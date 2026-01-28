/**
 * ==================================================
 * ADMIN API CONFIG — SINGLE SOURCE OF TRUTH
 * ==================================================
 *
 * PURPOSE:
 * - Define a safe, absolute API base URL
 * - Work in BOTH client and server environments
 * - Support Django session auth + CSRF
 *
 * NON-NEGOTIABLE RULES:
 * - Server fetches MUST use absolute URLs
 * - credentials: "include" is REQUIRED
 * - Admin data must NEVER be cached
 */

/**
 * Resolve API base URL safely for:
 * - Browser (NEXT_PUBLIC_*)
 * - Server (API_BASE_URL)
 * - Local development fallback
 *
 * Trailing slash is ALWAYS stripped to avoid:
 *   undefined//api
 *   double slashes
 */
export const API_BASE: string = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://wheat-polyester-inter-chat.trycloudflare.com"
).replace(/\/$/, "");

/**
 * Default fetch options for ALL admin API calls
 *
 * Why these are mandatory:
 * - credentials: "include"
 *   → Django session auth
 *   → CSRF cookie transmission
 *
 * - cache: "no-store"
 *   → Admin views must NEVER be stale
 */
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: "include",
  cache: "no-store",
};
