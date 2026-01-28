// lib/admin-api/helpers.ts

export async function safeJson<T>(res: Response): Promise<T> {
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON response from server");
  }
}

export async function parseErrorResponse(res: Response): Promise<string> {
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
