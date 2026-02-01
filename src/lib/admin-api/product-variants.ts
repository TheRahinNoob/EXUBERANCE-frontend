// ==================================================
// ADMIN PRODUCT VARIANT API (CANONICAL)
// ==================================================
//
// Rules:
// - Backend is SINGLE source of truth
// - NO manual CSRF handling
// - ALL mutations use adminFetch
// - Trailing slashes are NON-NEGOTIABLE
// - Safe for Next.js App Router
//

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
  adminFetch,
} from "./config";

import {
  safeJson,
  parseErrorResponse,
} from "./helpers";

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
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to load variants (${res.status})`
    );
  }

  const data = await safeJson<{
    items: AdminProductVariant[];
  }>(res);

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

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${productId}/variants/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

  const res = await adminFetch(
    `${API_BASE}/api/admin/product-variants/${variantId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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

  const res = await adminFetch(
    `${API_BASE}/api/admin/product-variants/${variantId}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
