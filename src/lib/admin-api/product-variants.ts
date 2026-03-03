// ==================================================
// ADMIN PRODUCT VARIANT API (CANONICAL)
// ==================================================
//
// Rules:
// - Backend is SINGLE source of truth
// - NO CSRF
// - NO cookies
// - ALL admin calls use adminFetch
// - Trailing slashes are NON-NEGOTIABLE
// - Safe for Next.js App Router
//

import { API_BASE, adminFetch } from "./config";
import { safeJson, parseErrorResponse } from "./helpers";

/* ==================================================
   TYPES — STRICT BACKEND CONTRACT
================================================== */

export type AdminProductVariant = Readonly<{
  id: number;
  size: string;
  color: string;
  color_hex: string; // "#RRGGBB" or ""
  stock: number;
}>;

export type AdminBulkVariantCreateResult = Readonly<{
  color: string;
  color_hex: string; // ✅ backend returns it
  default_stock: number;
  created: AdminProductVariant[];
  skipped_existing: string[];
}>;

/* ==================================================
   INTERNAL HELPERS
================================================== */

function assertFiniteId(value: unknown, label = "id"): asserts value is number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

function normalizeToken(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function ensureNonEmptyString(value: unknown, field: string): string {
  const token = normalizeToken(value);
  if (!token) throw new Error(`${field} is required`);
  return token;
}

function coerceNonNegativeInt(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${field} must be a number`);
  const int = Math.trunc(n);
  if (int < 0) throw new Error(`${field} cannot be negative`);
  return int;
}

/**
 * Accepts: "", "#RRGGBB" (case-insensitive, we will uppercase)
 * Rejects: anything else
 */
function normalizeHexColor(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();

  if (!/^#[0-9A-F]{6}$/.test(upper)) {
    throw new Error("Color hex must be in the format #RRGGBB");
  }

  return upper;
}

function isAdminProductVariant(v: unknown): v is AdminProductVariant {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;

  const hex = typeof o.color_hex === "string" ? o.color_hex : null;
  const hexOk = hex !== null && (hex === "" || /^#[0-9A-Fa-f]{6}$/.test(hex));

  return (
    typeof o.id === "number" &&
    Number.isFinite(o.id) &&
    typeof o.size === "string" &&
    typeof o.color === "string" &&
    hexOk &&
    typeof o.stock === "number" &&
    Number.isFinite(o.stock)
  );
}

/* ==================================================
   FETCH VARIANTS (PER PRODUCT)
================================================== */

export async function fetchAdminProductVariants(
  productId: number
): Promise<AdminProductVariant[]> {
  assertFiniteId(productId, "product id");

  const res = await adminFetch(`${API_BASE}/api/admin/products/${productId}/variants/`);

  if (!res.ok) {
    throw new Error(`Failed to load variants (${res.status})`);
  }

  const data = await safeJson<{ items: unknown }>(res);

  const items = (data as any)?.items;
  if (!Array.isArray(items)) {
    throw new Error("Invalid variant response format");
  }

  const validated: AdminProductVariant[] = [];
  for (const item of items) {
    if (!isAdminProductVariant(item)) {
      throw new Error("Invalid variant in response");
    }
    validated.push(item);
  }

  return validated;
}

/* ==================================================
   CREATE VARIANT (SINGLE)
================================================== */

export async function createAdminProductVariant(
  productId: number,
  payload: {
    size: string;
    color: string;
    color_hex?: string;
    stock: number;
  }
): Promise<AdminProductVariant> {
  assertFiniteId(productId, "product id");

  const size = ensureNonEmptyString(payload?.size, "Size");
  const color = ensureNonEmptyString(payload?.color, "Color");
  const color_hex = normalizeHexColor(payload?.color_hex ?? "");
  const stock = coerceNonNegativeInt(payload?.stock ?? 0, "Stock");

  const res = await adminFetch(`${API_BASE}/api/admin/products/${productId}/variants/`, {
    method: "POST",
    body: JSON.stringify({ size, color, color_hex, stock }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<unknown>(res);

  if (!isAdminProductVariant(data)) {
    throw new Error("Invalid create variant response");
  }

  return data;
}

/* ==================================================
   BULK CREATE VARIANTS (ONE COLOR + MANY SIZES)
================================================== */

export async function bulkCreateAdminProductVariants(
  productId: number,
  payload: {
    color: string;
    color_hex?: string;
    sizes: string[];
    default_stock?: number;
  }
): Promise<AdminBulkVariantCreateResult> {
  assertFiniteId(productId, "product id");

  const color = ensureNonEmptyString(payload?.color, "Color");
  const color_hex = normalizeHexColor(payload?.color_hex ?? "");

  if (!Array.isArray(payload?.sizes)) {
    throw new Error("Sizes must be a list");
  }

  const seen = new Set<string>();
  const sizes = payload.sizes
    .map((s) => normalizeToken(s))
    .filter((s) => s.length > 0)
    .filter((s) => (seen.has(s) ? false : (seen.add(s), true)));

  if (sizes.length === 0) {
    throw new Error("Sizes must be a non-empty list");
  }

  const default_stock = coerceNonNegativeInt(payload?.default_stock ?? 0, "Default stock");

  const res = await adminFetch(`${API_BASE}/api/admin/products/${productId}/variants/bulk/`, {
    method: "POST",
    body: JSON.stringify({ color, color_hex, sizes, default_stock }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<unknown>(res);

  if (!data || typeof data !== "object") {
    throw new Error("Invalid bulk create variant response");
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.color !== "string") {
    throw new Error("Invalid bulk create response: color");
  }

  if (typeof obj.color_hex !== "string") {
    throw new Error("Invalid bulk create response: color_hex");
  }

  if (typeof obj.default_stock !== "number" || !Number.isFinite(obj.default_stock)) {
    throw new Error("Invalid bulk create response: default_stock");
  }

  if (!Array.isArray(obj.created) || !Array.isArray(obj.skipped_existing)) {
    throw new Error("Invalid bulk create response: created/skipped_existing");
  }

  const createdRaw = obj.created as unknown[];
  const created: AdminProductVariant[] = [];
  for (const v of createdRaw) {
    if (!isAdminProductVariant(v)) {
      throw new Error("Invalid variant in bulk create response");
    }
    created.push(v);
  }

  const skipped_existing_raw = obj.skipped_existing as unknown[];
  for (const s of skipped_existing_raw) {
    if (typeof s !== "string") {
      throw new Error("Invalid skipped_existing in bulk create response");
    }
  }

  return {
    color: obj.color,
    color_hex: obj.color_hex,
    default_stock: obj.default_stock,
    created,
    skipped_existing: skipped_existing_raw as string[],
  };
}

/* ==================================================
   UPDATE VARIANT (PATCH)
   - supports stock
   - supports color_hex
================================================== */

export async function updateAdminVariant(
  variantId: number,
  payload: { stock?: number; color_hex?: string }
): Promise<Pick<AdminProductVariant, "id" | "stock" | "color_hex">> {
  assertFiniteId(variantId, "variant id");

  const body: Record<string, unknown> = {};

  if (payload.stock !== undefined) {
    body.stock = coerceNonNegativeInt(payload.stock, "Stock");
  }

  if (payload.color_hex !== undefined) {
    body.color_hex = normalizeHexColor(payload.color_hex);
  }

  if (Object.keys(body).length === 0) {
    throw new Error("Nothing to update");
  }

  const res = await adminFetch(`${API_BASE}/api/admin/product-variants/${variantId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<unknown>(res);

  if (!data || typeof data !== "object") {
    throw new Error("Invalid update variant response");
  }

  const o = data as Record<string, unknown>;
  if (typeof o.id !== "number" || !Number.isFinite(o.id)) throw new Error("Invalid update response: id");
  if (typeof o.stock !== "number" || !Number.isFinite(o.stock)) throw new Error("Invalid update response: stock");
  if (typeof o.color_hex !== "string") throw new Error("Invalid update response: color_hex");

  return { id: o.id, stock: o.stock, color_hex: o.color_hex };
}

/* ==================================================
   BACKWARD-COMPAT: stock-only helper
================================================== */

export async function updateAdminVariantStock(variantId: number, stock: number): Promise<void> {
  await updateAdminVariant(variantId, { stock });
}

/* ==================================================
   DELETE VARIANT
================================================== */

export async function deleteAdminVariant(variantId: number): Promise<void> {
  assertFiniteId(variantId, "variant id");

  const res = await adminFetch(`${API_BASE}/api/admin/product-variants/${variantId}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}