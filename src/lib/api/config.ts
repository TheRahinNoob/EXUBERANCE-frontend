/**
 * ==================================================
 * PUBLIC API CONFIG
 * ==================================================
 *
 * Used by:
 * - Public site (landing, shop, navbar, etc.)
 *
 * RULES:
 * - NO credentials
 * - NO cookies
 * - SAFE for RSC / SSR / ISR
 */

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

/**
 * API base (no trailing slash)
 * Example: http://localhost:8000
 */
export const API_BASE = RAW_API_BASE.replace(/\/$/, "");

/**
 * Media base
 * Used to resolve ImageField URLs from Django
 * Example: http://localhost:8000/media/...
 */
export const MEDIA_BASE = API_BASE;
