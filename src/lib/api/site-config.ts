/**
 * ==================================================
 * SITE API CONFIG (PUBLIC, SSR-SAFE)
 * ==================================================
 *
 * RULES:
 * - NO env access here
 * - NO hardcoded URLs
 * - API base is imported from central config
 */

import { API_BASE } from "@/lib/admin-api/config";

/**
 * Public site API base
 * - Already validated
 * - Trailing slash already stripped
 */
export const SITE_API_BASE: string = API_BASE;
