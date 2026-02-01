/**
 * ==================================================
 * ADMIN CMS API — LANDING MENU ITEMS (CANONICAL)
 * ==================================================
 *
 * RESPONSIBILITY:
 * - Manage landing page BODY MENU items
 * - Thin, strict client over Django Admin logic
 *
 * PRINCIPLES:
 * - Backend is the single source of truth
 * - No inferred state
 * - Explicit CREATE vs UPDATE
 * - DRF error fidelity preserved
 *
 * GUARANTEES:
 * - Session auth + CSRF (centralized)
 * - Stable response contract
 * - No silent coercion
 */

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
  adminFetch,
} from "@/lib/admin-api/config";

import {
  safeJson,
  parseErrorResponse,
} from "@/lib/admin-api/helpers";

/* ==================================================
   TYPES — BACKEND CONTRACT
================================================== */

/**
 * Embedded category snapshot (immutable)
 */
export type AdminLandingMenuCategory = {
  id: number;
  name: string;
  slug: string;
};

/**
 * Landing Menu Item (admin shape)
 */
export type AdminLandingMenuItem = {
  id: number;

  category: AdminLandingMenuCategory;

  seo_title: string;
  seo_description: string;

  is_active: boolean;
  ordering: number;

  created_at: string;
  updated_at: string;
};

/* ==================================================
   PAYLOAD TYPES
================================================== */

/**
 * CREATE payload
 * - category_id REQUIRED
 */
export type AdminLandingMenuItemCreatePayload = {
  category_id: number;

  is_active?: boolean;
  ordering?: number;

  seo_title?: string;
  seo_description?: string;
};

/**
 * UPDATE payload
 * - category_id NOT allowed
 * - Everything optional
 */
export type AdminLandingMenuItemUpdatePayload = {
  is_active?: boolean;
  ordering?: number;

  seo_title?: string;
  seo_description?: string;
};

/* ==================================================
   INTERNAL CONSTANTS
================================================== */

const BASE_URL = `${API_BASE}/api/admin/cms/landing-menu-items/`;

/* ==================================================
   INTERNAL HELPERS
================================================== */

/**
 * Preserve DRF error messages exactly
 */
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

/* ==================================================
   API FUNCTIONS
================================================== */

/**
 * --------------------------------------------------
 * GET — LIST LANDING MENU ITEMS
 * --------------------------------------------------
 */
export async function fetchAdminLandingMenuItems(): Promise<
  AdminLandingMenuItem[]
> {
  const res = await fetch(BASE_URL, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "GET",
  });

  const data = await handleResponse<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid landing menu items response");
  }

  return data as AdminLandingMenuItem[];
}

/**
 * --------------------------------------------------
 * POST — CREATE LANDING MENU ITEM
 * --------------------------------------------------
 */
export async function createAdminLandingMenuItem(
  payload: AdminLandingMenuItemCreatePayload
): Promise<AdminLandingMenuItem> {
  if (!Number.isFinite(payload.category_id)) {
    throw new Error("category_id is required");
  }

  const res = await adminFetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AdminLandingMenuItem>(res);
}

/**
 * --------------------------------------------------
 * PATCH — UPDATE LANDING MENU ITEM
 * --------------------------------------------------
 */
export async function updateAdminLandingMenuItem(
  id: number,
  payload: AdminLandingMenuItemUpdatePayload
): Promise<AdminLandingMenuItem> {
  if (!Number.isFinite(id)) {
    throw new Error("LandingMenuItem id is required");
  }

  const res = await adminFetch(`${BASE_URL}${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AdminLandingMenuItem>(res);
}

/**
 * --------------------------------------------------
 * DELETE — REMOVE LANDING MENU ITEM
 * --------------------------------------------------
 */
export async function deleteAdminLandingMenuItem(
  id: number
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("LandingMenuItem id is required");
  }

  const res = await adminFetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
