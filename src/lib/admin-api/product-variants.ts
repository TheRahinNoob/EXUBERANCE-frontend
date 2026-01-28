// src/lib/admin-api/product-variants.ts
// ==================================================
// ADMIN PRODUCT VARIANT API
// ==================================================
//
// Rules (STRICT):
// - Handles ONLY ProductVariant domain
// - Backend is SINGLE SOURCE OF TRUTH
// - Trailing slashes are NON-NEGOTIABLE
// - Safe for Next.js App Router
//

import { API_BASE, DEFAULT_FETCH_OPTIONS } from "./config";
import { safeJson, parseErrorResponse } from "./helpers";
import { getCSRFToken } from "./csrf";

/* ==================================================
   TYPES — STRICT BACKEND CONTRACT
================================================== */

export type AdminProductVariant = Readonly<{
  id: number;
  size: string;
  color: string;
  stock: number;
}>;

/* ==================================================
   INTERNAL HELPERS
================================================== */

function assertFiniteId(
  value: unknown,
  label = "id"
): asserts value is number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

/* ==================================================
   FETCH VARIANTS (PER PRODUCT)
================================================== */

export async function fetchAdminProductVariants(
  productId: number
): Promise<AdminProductVariant[]> {
  assertFiniteId(productId, "product id");

  const res = await fetch(
    `${API_BASE}/api/admin/products/${productId}/variants/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "GET",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to load variants (${res.status})`
    );
  }

  const data = await safeJson<{
    items: AdminProductVariant[];
  }>(res);

  // 🔒 HARD CONTRACT CHECK
  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.items)
  ) {
    throw new Error("Invalid variant response format");
  }

  return data.items;
}

/* ==================================================
   CREATE VARIANT
================================================== */

export async function createAdminProductVariant(
  productId: number,
  payload: {
    size: string;
    color: string;
    stock: number;
  }
): Promise<AdminProductVariant> {
  assertFiniteId(productId, "product id");

  if (!payload?.size || !payload?.color) {
    throw new Error("Size and color are required");
  }

  const csrf = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${productId}/variants/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
      body: JSON.stringify({
        size: payload.size,
        color: payload.color,
        stock: Number(payload.stock ?? 0),
      }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<AdminProductVariant>(res);

  // 🔒 HARD CONTRACT CHECK
  if (
    !data ||
    typeof data.id !== "number" ||
    typeof data.size !== "string" ||
    typeof data.color !== "string" ||
    typeof data.stock !== "number"
  ) {
    throw new Error("Invalid create variant response");
  }

  return data;
}

/* ==================================================
   UPDATE VARIANT STOCK
================================================== */

export async function updateAdminVariantStock(
  variantId: number,
  stock: number
): Promise<void> {
  assertFiniteId(variantId, "variant id");

  const csrf = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/product-variants/${variantId}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
      body: JSON.stringify({
        stock: Number(stock),
      }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   DELETE VARIANT
================================================== */

export async function deleteAdminVariant(
  variantId: number
): Promise<void> {
  assertFiniteId(variantId, "variant id");

  const csrf = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/product-variants/${variantId}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "DELETE",
      headers: csrf ? { "X-CSRFToken": csrf } : undefined,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
