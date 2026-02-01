// ==================================================
// ADMIN PRODUCT IMAGE API — GALLERY DOMAIN (CANONICAL)
// ==================================================
//
// Rules:
// - Backend is SINGLE source of truth
// - NO CSRF
// - NO cookies
// - ALL admin calls use adminFetch
// - Multipart-safe
// - Absolute URLs only
//

import {
  API_BASE,
  adminFetch,
} from "./config";

import {
  safeJson,
  parseErrorResponse,
} from "./helpers";

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

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${productId}/images/`
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch product images (${res.status})`
    );
  }

  const data = await safeJson<{
    items: AdminProductImage[];
  }>(res);

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

  const formData = new FormData();
  formData.append("image", file);

  if (options?.alt_text) {
    formData.append("alt_text", options.alt_text);
  }

  if (options?.is_primary !== undefined) {
    formData.append(
      "is_primary",
      String(Boolean(options.is_primary))
    );
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${productId}/images/`,
    {
      method: "POST",
      body: formData,
      // ❗ DO NOT set Content-Type
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<AdminProductImage>(res);

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
================================================== */

export async function setAdminProductPrimaryImage(
  imageId: number
): Promise<void> {
  assertFiniteId(imageId, "image id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/product-images/${imageId}/`,
    {
      method: "PATCH",
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

  const res = await adminFetch(
    `${API_BASE}/api/admin/product-images/${imageId}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
