// ==================================================
// ADMIN PRODUCT API — CORE PRODUCT DOMAIN (CANONICAL)
// ==================================================
//
// Rules:
// - Backend is the single source of truth
// - One mutation = one backend intent
// - ALL admin calls use adminFetch
// - NO CSRF
// - NO cookies
//

import {
  API_BASE,
  adminFetch,
} from "./config";

import {
  buildQuery,
  safeJson,
  parseErrorResponse,
} from "./helpers";

import type {
  AdminProduct,
  AdminProductDetail,
} from "./types";

import type {
  PaginatedResponse,
} from "./pagination";

/* ==================================================
   INTERNAL ASSERTIONS
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
   QUERY PARAM TYPES (STRICT CONTRACT)
================================================== */

export type FetchAdminProductsParams = {
  page?: number;
  page_size?: number;
  search?: string;
  signal?: AbortSignal;
};

/* ==================================================
   RESPONSE TYPES (STRICT BACKEND CONTRACTS)
================================================== */

export type AdminProductDeactivateResponse = Readonly<{
  id: number;
  is_active: false;
}>;

export type AdminProductUpdateResponse = Readonly<{
  id: number;
  price: string;
  old_price: string | null;
  is_active: boolean;
  is_featured: boolean;
  updated_at: string;
}>;

export type AdminProductBasicInfoUpdateResponse = Readonly<{
  id: number;
  name: string;
  slug: string;
  updated_at: string;
}>;

export type AdminProductDescriptionUpdateResponse = Readonly<{
  id: number;
  updated_at: string;
}>;

/* ==================================================
   LIST PRODUCTS
================================================== */

export async function fetchAdminProducts(
  params: FetchAdminProductsParams = {}
): Promise<PaginatedResponse<AdminProduct>> {
  const { signal, ...queryParams } = params;
  const query = buildQuery(queryParams);

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${query}`,
    { signal }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}

/* ==================================================
   PRODUCT DETAIL
================================================== */

export async function fetchAdminProductDetail(
  id: number,
  options?: { signal?: AbortSignal }
): Promise<AdminProductDetail> {
  assertFiniteId(id, "product id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${id}/`,
    { signal: options?.signal }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}

/* ==================================================
   CREATE PRODUCT
================================================== */

export async function createAdminProduct(payload: {
  name: string;
  slug: string;
  price: string | number;
  is_active?: boolean;
}): Promise<{
  id: number;
  name: string;
  slug: string;
  price: string;
  is_active: boolean;
  created_at: string;
}> {
  const res = await adminFetch(
    `${API_BASE}/api/admin/products/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}

/* ==================================================
   UPDATE BASIC INFO (NAME / SLUG)
================================================== */

export async function updateAdminProductBasicInfo(
  id: number,
  payload: { name: string; slug: string }
): Promise<AdminProductBasicInfoUpdateResponse> {
  assertFiniteId(id, "product id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${id}/basic/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}

/* ==================================================
   UPDATE PRODUCT (PRICE / FEATURED)
================================================== */

export async function updateAdminProduct(
  id: number,
  payload: {
    price?: string | number | null;
    old_price?: string | number | null;
    is_featured?: boolean;
  }
): Promise<AdminProductUpdateResponse> {
  assertFiniteId(id, "product id");

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== undefined
    )
  );

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(cleanPayload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}

/* ==================================================
   UPDATE PRODUCT DESCRIPTION (RICH HTML)
================================================== */

export async function updateAdminProductDescription(
  id: number,
  description: string
): Promise<AdminProductDescriptionUpdateResponse> {
  assertFiniteId(id, "product id");

  const payload = {
    description:
      typeof description === "string"
        ? description
        : "",
  };

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${id}/description/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}

/* ==================================================
   DEACTIVATE PRODUCT (SOFT DELETE — CANONICAL)
================================================== */

export async function deactivateAdminProduct(
  id: number
): Promise<AdminProductDeactivateResponse> {
  assertFiniteId(id, "product id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${id}/deactivate/`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}
