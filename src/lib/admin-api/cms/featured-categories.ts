// ==================================================
// ADMIN FEATURED CATEGORY API (CMS)
// ==================================================
//
// Guarantees:
// - Backend is the single source of truth
// - No cached admin data
// - CSRF + session auth enforced
// - Strict typing (no `any` in logic)
// - Matches Django Admin behavior exactly
//

import { API_BASE, DEFAULT_FETCH_OPTIONS } from "../config";
import { getCSRFToken } from "../csrf";
import { safeJson, parseErrorResponse } from "../helpers";

/* ==================================================
   TYPES
================================================== */

export type AdminFeaturedCategory = {
  id: number;
  ordering: number;
  is_active: boolean;
  image: string | null;

  category: {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
  };
};

export type AdminFeaturedCategoryCreatePayload = {
  category_id: number;
  image: File;
  is_active?: boolean;
};

export type AdminFeaturedCategoryUpdatePayload = {
  ordering?: number;
  is_active?: boolean;
  image?: File;
};

/* ==================================================
   RUNTIME VALIDATION (DEFENSIVE)
================================================== */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertFeaturedCategory(
  value: unknown
): asserts value is AdminFeaturedCategory {
  if (!isObject(value)) {
    throw new Error("Invalid featured category object");
  }

  if (
    typeof value.id !== "number" ||
    typeof value.ordering !== "number" ||
    typeof value.is_active !== "boolean" ||
    !isObject(value.category) ||
    typeof value.category.id !== "number" ||
    typeof value.category.name !== "string" ||
    typeof value.category.slug !== "string" ||
    typeof value.category.is_active !== "boolean"
  ) {
    throw new Error("Invalid featured category structure");
  }
}

/* ==================================================
   FETCH — LIST FEATURED CATEGORIES
================================================== */

/**
 * GET /api/admin/cms/featured-categories/
 */
export async function fetchAdminFeaturedCategories(): Promise<
  AdminFeaturedCategory[]
> {
  const res = await fetch(
    `${API_BASE}/api/admin/cms/featured-categories/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch featured categories (${res.status})`
    );
  }

  const data = await safeJson<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid featured category list response");
  }

  for (const item of data) {
    assertFeaturedCategory(item);
  }

  return data;
}

/* ==================================================
   CREATE — FEATURED CATEGORY
================================================== */

/**
 * POST /api/admin/cms/featured-categories/
 */
export async function createAdminFeaturedCategory(
  payload: AdminFeaturedCategoryCreatePayload
): Promise<AdminFeaturedCategory> {
  if (!Number.isFinite(payload.category_id)) {
    throw new Error("Invalid category_id");
  }

  if (!(payload.image instanceof File)) {
    throw new Error("Image file is required");
  }

  const csrfToken = getCSRFToken();
  const formData = new FormData();

  formData.append("category_id", String(payload.category_id));
  formData.append("image", payload.image);

  if (payload.is_active !== undefined) {
    formData.append(
      "is_active",
      payload.is_active ? "true" : "false"
    );
  }

  const res = await fetch(
    `${API_BASE}/api/admin/cms/featured-categories/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "POST",
      headers: csrfToken
        ? { "X-CSRFToken": csrfToken }
        : undefined,
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<unknown>(res);
  assertFeaturedCategory(data);

  return data;
}

/* ==================================================
   UPDATE — FEATURED CATEGORY
================================================== */

/**
 * PATCH /api/admin/cms/featured-categories/{id}/
 */
export async function updateAdminFeaturedCategory(
  id: number,
  payload: AdminFeaturedCategoryUpdatePayload
): Promise<AdminFeaturedCategory> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid featured category id");
  }

  if (
    payload.ordering === undefined &&
    payload.is_active === undefined &&
    !(payload.image instanceof File)
  ) {
    throw new Error("No valid fields provided for update");
  }

  const csrfToken = getCSRFToken();
  const formData = new FormData();

  if (payload.ordering !== undefined) {
    if (!Number.isFinite(payload.ordering) || payload.ordering < 0) {
      throw new Error("ordering must be a non-negative number");
    }
    formData.append("ordering", String(payload.ordering));
  }

  if (payload.is_active !== undefined) {
    formData.append(
      "is_active",
      payload.is_active ? "true" : "false"
    );
  }

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  const res = await fetch(
    `${API_BASE}/api/admin/cms/featured-categories/${id}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: csrfToken
        ? { "X-CSRFToken": csrfToken }
        : undefined,
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const data = await safeJson<unknown>(res);
  assertFeaturedCategory(data);

  return data;
}

/* ==================================================
   DELETE — FEATURED CATEGORY
================================================== */

/**
 * DELETE /api/admin/cms/featured-categories/{id}/
 */
export async function deleteAdminFeaturedCategory(
  id: number
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid featured category id");
  }

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/cms/featured-categories/${id}/`,
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
