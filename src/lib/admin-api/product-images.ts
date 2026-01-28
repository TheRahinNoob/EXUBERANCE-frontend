// src/lib/admin-api/product-images.ts
// ==================================================
// ADMIN PRODUCT IMAGE API — GALLERY DOMAIN
// ==================================================
//
// RULES (STRICT):
// - Handles ONLY ProductImage domain
// - Backend is SINGLE SOURCE OF TRUTH
// - NO UI state logic here
// - NO product mutations here
// - Absolute URLs only
//

import { API_BASE, DEFAULT_FETCH_OPTIONS } from "./config";
import { safeJson, parseErrorResponse } from "./helpers";
import { getCSRFToken } from "./csrf";

/* ==================================================
   TYPES — STRICT BACKEND CONTRACT
================================================== */

export type AdminProductImage = Readonly<{
  id: number;
  image: string;          // absolute URL
  alt_text: string;
  is_primary: boolean;
  ordering: number;
  created_at: string;     // ISO
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
   FETCH PRODUCT IMAGES (ADMIN)
   Backend response: { items: AdminProductImage[] }
================================================== */

export async function fetchAdminProductImages(
  productId: number
): Promise<AdminProductImage[]> {
  assertFiniteId(productId, "product id");

  const res = await fetch(
    `${API_BASE}/api/admin/products/${productId}/images/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "GET",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch product images (${res.status})`
    );
  }

  const data = await safeJson<{
    items: AdminProductImage[];
  }>(res);

  // 🔒 HARD CONTRACT CHECK
  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.items)
  ) {
    throw new Error(
      "Invalid product images response format"
    );
  }

  return data.items;
}

/* ==================================================
   UPLOAD PRODUCT IMAGE (ADMIN)
================================================== */

export async function uploadAdminProductImage(
  productId: number,
  file: File,
  options?: {
    alt_text?: string;
    is_primary?: boolean;
  }
): Promise<AdminProductImage> {
  assertFiniteId(productId, "product id");

  if (!(file instanceof File)) {
    throw new Error("Invalid image file");
  }

  const csrfToken = getCSRFToken();
  const formData = new FormData();

  formData.append("image", file);

  if (options?.alt_text) {
    formData.append("alt_text", options.alt_text);
  }

  if (options?.is_primary !== undefined) {
    formData.append(
      "is_primary",
      String(options.is_primary)
    );
  }

  const res = await fetch(
    `${API_BASE}/api/admin/products/${productId}/images/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "POST",
      headers: csrfToken
        ? { "X-CSRFToken": csrfToken }
        : undefined,
      body: formData,
      // ❗ NEVER set Content-Type manually
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<AdminProductImage>(res);

  // 🔒 HARD CONTRACT CHECK
  if (
    !data ||
    typeof data !== "object" ||
    typeof data.id !== "number" ||
    typeof data.image !== "string" ||
    typeof data.is_primary !== "boolean"
  ) {
    throw new Error(
      "Invalid upload product image response"
    );
  }

  return data;
}

/* ==================================================
   SET PRIMARY IMAGE (ADMIN)
   🔥 FIXED: NO BODY, NO CONTENT-TYPE
================================================== */

export async function setAdminProductPrimaryImage(
  imageId: number
): Promise<void> {
  assertFiniteId(imageId, "image id");

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/product-images/${imageId}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: csrfToken
        ? { "X-CSRFToken": csrfToken }
        : undefined,
      // ✅ NO BODY
      // ✅ NO Content-Type
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   DELETE PRODUCT IMAGE (ADMIN)
================================================== */

export async function deleteAdminProductImage(
  imageId: number
): Promise<void> {
  assertFiniteId(imageId, "image id");

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/product-images/${imageId}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "DELETE",
      headers: csrfToken
        ? { "X-CSRFToken": csrfToken }
        : undefined,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
