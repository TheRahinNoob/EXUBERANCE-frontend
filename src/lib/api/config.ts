/**
 * ==================================================
 * PUBLIC API CONFIG
 * ==================================================
 *
 * Used by:
 * - Public site (landing, shop, navbar, etc.)
 *
 * RULES:
 * - NO env access here
 * - NO hardcoded URLs
 * - SAFE for RSC / SSR / ISR
 */

import { API_BASE } from "@/lib/admin-api/config";

/**
 * API base (no trailing slash)
 * Example:
 *   https://api.fabrilife.com
 */
export { API_BASE };

/**
 * Media base
 * Used to resolve ImageField URLs from Django
 *
 * NOTE:
 * - Media is served from the same origin as API
 * - If CDN is introduced later, change it centrally
 */
export const MEDIA_BASE = API_BASE;
