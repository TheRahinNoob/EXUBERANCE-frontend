/**
 * ==================================================
 * ADMIN CMS API — HERO BANNERS
 * ==================================================
 *
 * DESIGN PRINCIPLES:
 * - Strict backend contract
 * - CREATE !== UPDATE (explicit typing)
 * - Multipart-safe (file uploads)
 * - CSRF-safe (Django session auth)
 * - Zero inference, zero silent coercion
 */

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
  safeJson,
  parseErrorResponse,
} from "@/lib/admin-api";

import { getCSRFToken } from "@/lib/admin-api/csrf";

/* ==================================================
   TYPES — BACKEND CONTRACT
================================================== */

export type AdminHeroBanner = {
  id: number;

  image_desktop: string | null;
  image_tablet: string | null;
  image_mobile: string | null;

  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;

  ordering: number;
  created_at: string;

  is_live: boolean;
};

/* ==================================================
   PAYLOAD TYPES
================================================== */

/**
 * CREATE:
 * - Desktop image is REQUIRED
 */
export type AdminHeroBannerCreatePayload = {
  image_desktop: File;
  image_tablet?: File;
  image_mobile?: File;

  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  ordering?: number;
};

/**
 * UPDATE:
 * - Everything optional
 * - Only provided fields are changed
 */
export type AdminHeroBannerUpdatePayload = {
  image_desktop?: File;
  image_tablet?: File;
  image_mobile?: File;

  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  ordering?: number;
};

/* ==================================================
   INTERNAL CONSTANTS
================================================== */

const BASE_URL = `${API_BASE}/api/admin/cms/hero-banners/`;

/* ==================================================
   TYPE GUARDS — DRF ERROR SAFETY
================================================== */

function hasDetail(
  data: unknown
): data is { detail: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof (data as any).detail === "string"
  );
}

/* ==================================================
   INTERNAL HELPERS
================================================== */

function mutationHeaders(): HeadersInit {
  const csrf = getCSRFToken();
  return csrf ? { "X-CSRFToken": csrf } : {};
}

/**
 * Unified response handler
 * - Preserves DRF error messages verbatim
 */
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await safeJson(res);

  if (!res.ok) {
    throw new Error(
      hasDetail(data)
        ? data.detail
        : await parseErrorResponse(res)
    );
  }

  return data as T;
}

/**
 * Strongly typed FormData builder
 * - Skips undefined
 * - Converts null → empty string
 * - Accepts File | string | number | boolean
 */
function buildFormData<T extends Record<string, unknown>>(
  payload: T
): FormData {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === null) {
      fd.append(key, "");
      return;
    }

    if (value instanceof File) {
      fd.append(key, value);
      return;
    }

    fd.append(key, String(value));
  });

  return fd;
}

/* ==================================================
   API FUNCTIONS
================================================== */

/**
 * LIST
 */
export async function fetchAdminHeroBanners(): Promise<
  AdminHeroBanner[]
> {
  const res = await fetch(BASE_URL, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "GET",
  });

  const data = await handleResponse<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid hero banners response");
  }

  return data as AdminHeroBanner[];
}

/**
 * CREATE
 */
export async function createAdminHeroBanner(
  payload: AdminHeroBannerCreatePayload
): Promise<AdminHeroBanner> {
  if (!payload.image_desktop) {
    throw new Error("image_desktop is required");
  }

  const res = await fetch(BASE_URL, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "POST",
    headers: mutationHeaders(),
    body: buildFormData(payload),
  });

  return handleResponse<AdminHeroBanner>(res);
}

/**
 * UPDATE
 */
export async function updateAdminHeroBanner(
  id: number,
  payload: AdminHeroBannerUpdatePayload
): Promise<AdminHeroBanner> {
  if (!id) {
    throw new Error("HeroBanner id is required");
  }

  const res = await fetch(`${BASE_URL}${id}/`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "PATCH",
    headers: mutationHeaders(),
    body: buildFormData(payload),
  });

  return handleResponse<AdminHeroBanner>(res);
}

/**
 * DELETE
 */
export async function deleteAdminHeroBanner(
  id: number
): Promise<void> {
  if (!id) {
    throw new Error("HeroBanner id is required");
  }

  const res = await fetch(`${BASE_URL}${id}/`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "DELETE",
    headers: mutationHeaders(),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
