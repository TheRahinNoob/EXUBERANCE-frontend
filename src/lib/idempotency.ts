export function getCheckoutIdempotencyKey(): string {
  const key = sessionStorage.getItem("checkout_idempotency");

  if (key) return key;

  const newKey = crypto.randomUUID();
  sessionStorage.setItem("checkout_idempotency", newKey);

  return newKey;
}

export function clearCheckoutIdempotencyKey() {
  sessionStorage.removeItem("checkout_idempotency");
}
