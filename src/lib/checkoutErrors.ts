export function normalizeCheckoutError(raw: unknown): string {
  if (raw instanceof Error) return raw.message;

  if (typeof raw === "string") return raw;

  if (typeof raw === "object" && raw !== null) {
    for (const value of Object.values(raw)) {
      if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
      }
    }
  }

  return "Something went wrong. Please try again.";
}
