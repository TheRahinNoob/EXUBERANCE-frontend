export function getCSRFToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}
