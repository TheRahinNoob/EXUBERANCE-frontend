// src/lib/admin-api/helpers.ts

/**
 * ==================================================
 * SAFE JSON PARSER
 * ==================================================
 */
export async function safeJson<T>(res: Response): Promise<T> {
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON response from server");
  }
}

/**
 * ==================================================
 * ERROR RESPONSE PARSER (DJANGO / DRF SAFE)
 * ==================================================
 */
export async function parseErrorResponse(
  res: Response
): Promise<string> {
  try {
    const data = await res.json();
    return (
      data?.message ||
      data?.detail ||
      data?.error ||
      data?.non_field_errors?.[0] ||
      "Request failed"
    );
  } catch {
    return "Request failed";
  }
}

/**
 * ==================================================
 * QUERY STRING BUILDER
 * ==================================================
 */
export function buildQuery(
  params?: Record<string, string | number | undefined>
) {
  const query = new URLSearchParams();

  if (!params) return "";

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/**
 * ==================================================
 * CSRF TOKEN READER (DJANGO STANDARD)
 * ==================================================
 *
 * PURPOSE:
 * - Reads `csrftoken` cookie set by Django
 * - Used for POST / PATCH / DELETE requests
 *
 * SAFETY:
 * - SSR / RSC safe (returns null)
 * - Browser-only execution
 */
export function getCSRFCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    /(?:^|;\s*)csrftoken=([^;]+)/
  );

  return match ? decodeURIComponent(match[1]) : null;
}
