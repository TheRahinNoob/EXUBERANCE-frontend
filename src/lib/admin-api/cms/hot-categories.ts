// ==================================================
// ADMIN HOT CATEGORY API — CANONICAL
// ==================================================
//
// Mirrors Django Admin: HotCategoryAdmin
// Consumed by Next.js Admin Panel
//
// Guarantees:
// - JWT-based admin auth
// - Multipart image upload
// - Explicit failures
// - Backend is final authority
//

import {
  API_BASE,
  adminFetch,
} from "../config";

import {
  safeJson,
  parseErrorResponse,
} from "../helpers";

/* ==================================================
   TYPES
================================================== */

export type AdminHotCategory = {
  id: number;
  ordering: number;
  is_active: boolean;
  image: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
  };
};

export type AdminHotCategoryCreatePayload = {
  category_id: number;
  image: File;
  is_active?: boolean;
  ordering?: number;
};

export type AdminHotCategoryUpdatePayload = {
  is_active?: boolean;
  ordering?: number;
  image?: File;
};

/* ==================================================
   INTERNAL VALIDATION
================================================== */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertHotCategory(
  value: unknown
): asserts value is AdminHotCategory {
  if (!isObject(value)) {
    throw new Error("Invalid hot category object");
  }

  if (
    typeof value.id !== "number" ||
    typeof value.ordering !== "number" ||
    typeof value.is_active !== "boolean" ||
    (value.image !== null && typeof value.image !== "string") ||
    !isObject(value.category) ||
    typeof value.category.id !== "number" ||
    typeof value.category.name !== "string" ||
    typeof value.category.slug !== "string"
  ) {
    throw new Error("Invalid hot category structure");
  }
}

/* ==================================================
   FETCH — LIST
================================================== */

/**
 * GET /api/admin/cms/hot-categories/
 */
export async function fetchAdminHotCategories(): Promise<
  AdminHotCategory[]
> {
  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-categories/`
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch hot categories (${res.status})`
    );
  }

  const data = await safeJson<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid hot category list response");
  }

  for (const item of data) {
    assertHotCategory(item);
  }

  return data;
}

/* ==================================================
   CREATE — multipart
================================================== */

/**
 * POST /api/admin/cms/hot-categories/
 */
export async function createAdminHotCategory(
  payload: AdminHotCategoryCreatePayload
): Promise<AdminHotCategory> {
  if (!Number.isFinite(payload.category_id)) {
    throw new Error("category_id is required");
  }

  if (!(payload.image instanceof File)) {
    throw new Error("image file is required");
  }

  const formData = new FormData();
  formData.append(
    "category_id",
    String(payload.category_id)
  );
  formData.append("image", payload.image);

  if (payload.is_active !== undefined) {
    formData.append(
      "is_active",
      payload.is_active ? "true" : "false"
    );
  }

  if (payload.ordering !== undefined) {
    formData.append(
      "ordering",
      String(payload.ordering)
    );
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-categories/`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<unknown>(res);
  assertHotCategory(data);

  return data;
}

/* ==================================================
   UPDATE — multipart
================================================== */

/**
 * PATCH /api/admin/cms/hot-categories/{id}/
 */
export async function updateAdminHotCategory(
  id: number,
  payload: AdminHotCategoryUpdatePayload
): Promise<AdminHotCategory> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid hot category id");
  }

  if (
    payload.image === undefined &&
    payload.is_active === undefined &&
    payload.ordering === undefined
  ) {
    throw new Error("No fields provided for update");
  }

  const formData = new FormData();

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  if (payload.is_active !== undefined) {
    formData.append(
      "is_active",
      payload.is_active ? "true" : "false"
    );
  }

  if (payload.ordering !== undefined) {
    formData.append(
      "ordering",
      String(payload.ordering)
    );
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-categories/${id}/`,
    {
      method: "PATCH",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<unknown>(res);
  assertHotCategory(data);

  return data;
}

/* ==================================================
   DELETE
================================================== */

/**
 * DELETE /api/admin/cms/hot-categories/{id}/
 */
export async function deleteAdminHotCategory(
  id: number
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid hot category id");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-categories/${id}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
