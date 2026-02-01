// ==================================================
// ADMIN CMS — COMFORT RAILS API (CANONICAL)
// ==================================================
//
// Rules:
// - Backend is the single source of truth
// - Metadata updates use PATCH (JSON)
// - Image uploads use multipart/form-data ONLY
// - AbortController supported where meaningful
// - No field inference, no silent fixes
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
   TYPES — READ MODELS
================================================== */

export type AdminComfortCategoryRail = {
  id: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  image: string | null;
  auto_fill: boolean;
  auto_limit: number;
  is_active: boolean;
  ordering: number;
  products: {
    id: number;
    name: string;
    slug: string;
  }[];
  created_at: string;
};

/* ==================================================
   TYPES — WRITE MODELS
================================================== */

export type AdminComfortCategoryRailUpdatePayload = Partial<{
  auto_fill: boolean;
  auto_limit: number;
  is_active: boolean;
  ordering: number;
}>;

export type AdminComfortRailReorderPayload = {
  items: { id: number }[];
};

/* ==================================================
   INTERNAL HELPERS
================================================== */

function assertId(value: unknown, label: string): asserts value is number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

/* ==================================================
   FETCH — LIST
================================================== */

export async function fetchAdminComfortRails(
  options?: { signal?: AbortSignal }
): Promise<AdminComfortCategoryRail[]> {
  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/`,
    {
      signal: options?.signal,
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch comfort rails (${res.status})`
    );
  }

  const data = await safeJson<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid comfort rails list response");
  }

  return data as AdminComfortCategoryRail[];
}

/* ==================================================
   FETCH — DETAIL
================================================== */

export async function fetchAdminComfortRail(
  id: number,
  options?: { signal?: AbortSignal }
): Promise<AdminComfortCategoryRail> {
  assertId(id, "comfort rail id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/${id}/`,
    {
      signal: options?.signal,
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch comfort rail (${res.status})`
    );
  }

  return safeJson<AdminComfortCategoryRail>(res);
}

/* ==================================================
   CREATE — IMAGE REQUIRED (multipart/form-data)
================================================== */

export async function createAdminComfortRail(payload: {
  category_id: number;
  image: File;
}): Promise<AdminComfortCategoryRail> {
  assertId(payload.category_id, "category_id");

  if (!(payload.image instanceof File)) {
    throw new Error("image file is required");
  }

  const formData = new FormData();
  formData.append("category_id", String(payload.category_id));
  formData.append("image", payload.image);

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson<AdminComfortCategoryRail>(res);
}

/* ==================================================
   UPDATE — METADATA ONLY (PATCH JSON)
================================================== */

export async function updateAdminComfortRail(
  id: number,
  payload: AdminComfortCategoryRailUpdatePayload
): Promise<void> {
  assertId(id, "comfort rail id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   PATCH — IMAGE ONLY (multipart/form-data)
================================================== */

export async function updateAdminComfortRailImage(
  id: number,
  image: File
): Promise<{ image: string }> {
  assertId(id, "comfort rail id");

  if (!(image instanceof File)) {
    throw new Error("image file is required");
  }

  const formData = new FormData();
  formData.append("image", image);

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/${id}/image/`,
    {
      method: "PATCH",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson<{ image: string }>(res);
}

/* ==================================================
   DELETE
================================================== */

export async function deleteAdminComfortRail(
  id: number
): Promise<void> {
  assertId(id, "comfort rail id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/${id}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   PRODUCT ATTACH / DETACH
================================================== */

export async function addProductToComfortRail(
  railId: number,
  productId: number
): Promise<void> {
  assertId(railId, "comfort rail id");
  assertId(productId, "product id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/${railId}/products/`,
    {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

export async function removeProductFromComfortRail(
  railId: number,
  productId: number
): Promise<void> {
  assertId(railId, "comfort rail id");
  assertId(productId, "product id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/${railId}/products/${productId}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   REORDER
================================================== */

export async function reorderAdminComfortRails(
  payload: AdminComfortRailReorderPayload
): Promise<void> {
  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/comfort-rails/reorder/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
