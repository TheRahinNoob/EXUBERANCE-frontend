const MEDIA_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

export function resolveMediaUrl(path?: string | null) {
  if (!path) return "/placeholder.png";

  // Already absolute? return as-is
  if (path.startsWith("http")) return path;

  // Ensure single slash
  return `${MEDIA_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
