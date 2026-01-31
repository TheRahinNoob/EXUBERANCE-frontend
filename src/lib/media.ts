/* ==================================================
   MEDIA URL RESOLVER — SINGLE SOURCE OF TRUTH
================================================== */

import { API_BASE } from "@/lib/admin-api/config";

/**
 * Resolves media URLs coming from backend
 *
 * RULES:
 * - Absolute URLs → returned as-is
 * - Relative paths → expanded using API_BASE
 * - Empty/null → placeholder
 */
export function resolveMediaUrl(
  path?: string | null
): string {
  if (!path) {
    return "/placeholder.png";
  }

  // Already absolute? Return as-is
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Normalize relative media path
  return path.startsWith("/")
    ? `${API_BASE}${path}`
    : `${API_BASE}/${path}`;
}
