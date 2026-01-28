import { API_BASE } from "@/lib/admin-api";

/**
 * Resolve backend media URL safely
 * - Handles null
 * - Handles already-absolute URLs
 * - Handles relative /media paths
 */
export function resolveMediaUrl(
  src: string | null | undefined
): string | null {
  if (!src) return null;

  // already absolute
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // relative media path
  return `${API_BASE}${src}`;
}
