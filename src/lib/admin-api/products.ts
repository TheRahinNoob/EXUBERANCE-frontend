// ==================================================
// ADMIN PRODUCT API — CORE PRODUCT DOMAIN (CANONICAL)
// ==================================================
//
// Principles:
// - Backend is the single source of truth
// - Frontend NEVER infers business logic
// - Read-heavy, mutation-light
// - AbortController supported everywhere
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
   INTERNAL ASSERTION HELPERS
================================================== */

function assertFiniteId(
  value: unknown,
  label = "id"
): asserts value is number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

function assertObject(
  value: unknown,
  message: string
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new Error(message);
  }
}

/* ==================================================
   RESPONSE TYPES
================================================== */

export type AdminProductStatusToggleResponse = Readonly<{
  id: number;
  is_active: boolean;
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
  is_featured: boolean;
  updated_at: string;
}>;

export type AdminProductDescriptionUpdateResponse = Readonly<{
  id: number;
  updated_at: string;
}>;

/* ==================================================
   LIST PRODUCTS (ADMIN — READ ONLY)
================================================== */

export async function fetchAdminProducts(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  signal?: AbortSignal;
}): Promise<PaginatedResponse<AdminProduct>> {
  const { signal, ...queryParams } = params ?? {};
  const query = buildQuery(queryParams);

  const res = await fetch(
    `${API_BASE}/api/admin/products/${query}`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      signal,
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch admin products (${res.status})`
    );
  }

  const data =
    await safeJson<PaginatedResponse<AdminProduct>>(res);

  assertObject(data, "Invalid products response");

  if (!data.meta || !Array.isArray(data.items)) {
    throw new Error("Invalid products response format");
  }

  return data;
}

/* ==================================================
   PRODUCT DETAIL (ADMIN — READ ONLY)
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
    throw new Error(
      `Failed to fetch product (${res.status})`
    );
  }

  const data =
    await safeJson<AdminProductDetail>(res);

  assertObject(data, "Invalid product detail response");

  if (
    typeof data.id !== "number" ||
    !Array.isArray(data.variants) ||
    !Array.isArray(data.attributes)
  ) {
    throw new Error(
      "Invalid product detail response format"
    );
  }

  return data;
}

/* ==================================================
   CREATE PRODUCT (ADMIN — MINIMAL V1)  ✅🔥
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
  if (!payload.name?.trim()) {
    throw new Error("Product name is required");
  }

  if (!payload.slug?.trim()) {
    throw new Error("Product slug is required");
  }

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
      body: JSON.stringify({
        name: payload.name.trim(),
        slug: payload.slug.trim(),
        price: payload.price,
        is_active: payload.is_active ?? true,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}

/* ==================================================
   UPDATE PRODUCT BASIC INFO (ADMIN — IDENTITY)
================================================== */

export async function updateAdminProductBasicInfo(
  id: number,
  payload: {
    name: string;
    slug: string;
    is_featured?: boolean;
  }
): Promise<AdminProductBasicInfoUpdateResponse> {
  assertFiniteId(id, "product id");

  if (!payload.name.trim()) {
    throw new Error("Product name is required");
  }

  if (!payload.slug.trim()) {
    throw new Error("Product slug is required");
  }

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
   UPDATE PRODUCT (ADMIN — PRICE / FLAGS)
================================================== */

export async function updateAdminProduct(
  id: number,
  payload: {
    price?: string | number | null;
    old_price?: string | number | null;
    is_active?: boolean;
    is_featured?: boolean;
  }
): Promise<AdminProductUpdateResponse> {
  assertFiniteId(id, "product id");

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/`,
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
   UPDATE PRODUCT DESCRIPTION (ADMIN — RICH HTML)
================================================== */

export async function updateAdminProductDescription(
  id: number,
  description: string
): Promise<AdminProductDescriptionUpdateResponse> {
  assertFiniteId(id, "product id");

  if (typeof description !== "string") {
    throw new Error("Description must be a string");
  }

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/description/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
      body: JSON.stringify({ description }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}

/* ==================================================
   TOGGLE PRODUCT ACTIVE / INACTIVE
================================================== */

export async function toggleAdminProductStatus(
  id: number
): Promise<AdminProductStatusToggleResponse> {
  assertFiniteId(id, "product id");

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/status/`,
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
