// src/lib/admin-api/csrf.ts

/**
 * ==================================================
 * CSRF TOKEN HELPER (DJANGO COMPATIBLE)
 * --------------------------------------------------
 * Reads CSRF token from Django's `csrftoken` cookie.
 *
 * Guarantees:
 * - Safe for Next.js App Router
 * - Safe for SSR / RSC (returns null)
 * - Compatible with session-based auth
 * - Zero side effects
 *
 * IMPORTANT:
 * - This function ONLY reads the token
 * - It NEVER sets headers
 * - It NEVER mutates cookies
 * ==================================================
 */

export function getCSRFToken(): string | null {
  // SSR / Server Components safety
  if (typeof document === "undefined") {
    return null;
  }

  // Strict, fast cookie match (Django standard)
  const match = document.cookie.match(
    /(?:^|;\s*)csrftoken=([^;]+)/
  );

  return match ? decodeURIComponent(match[1]) : null;
}
