// ==================================================
// ADMIN PRODUCT API — CORE PRODUCT DOMAIN (CANONICAL)
// ==================================================
//
// Rules:
// - Backend is the single source of truth
// - One mutation = one backend intent
// - No inferred state transitions
//

import { API_BASE, DEFAULT_FETCH_OPTIONS } from "./config";
import {
  buildQuery,
  safeJson,
  parseErrorResponse,
} from "./helpers";
import { getCSRFToken } from "./csrf";

import type {
  AdminProduct,
  AdminProductDetail,
} from "./types";
import type { PaginatedResponse } from "./pagination";

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

/**
 * 🔍 Product list query parameters
 * MUST match backend query support
 */
export type FetchAdminProductsParams = {
  page?: number;
  page_size?: number;

  /** 🔍 Search by name / SKU / keyword */
  search?: string;

  /** Abort controller for in-flight requests */
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

  const res = await fetch(
    `${API_BASE}/api/admin/products/${query}`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      signal,
    }
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

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      signal: options?.signal,
    }
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
  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
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

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/basic/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
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

  const csrfToken = getCSRFToken();

  // 🔒 Strip undefined keys (IMPORTANT)
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== undefined
    )
  );

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
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

  const csrfToken = getCSRFToken();

  // 🔥 Backend contract: description must exist
  const payload = {
    description:
      typeof description === "string" ? description : "",
  };

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/description/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
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

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/deactivate/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "POST",
      headers: csrfToken
        ? { "X-CSRFToken": csrfToken }
        : undefined,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}
