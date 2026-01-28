/**
 * ==================================================
 * ADMIN CMS API — LANDING BLOCKS (CANONICAL)
 * ==================================================
 *
 * PRINCIPLES:
 * - Backend is the SINGLE source of truth
 * - Frontend is a THIN transport layer
 * - NO business logic in frontend
 * - NO guessing, NO inference
 * - Errors are surfaced EXACTLY as backend sends
 */

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
} from "@/lib/admin-api/config";

import { safeJson, parseErrorResponse } from "@/lib/admin-api/helpers";
import { getCSRFToken } from "@/lib/admin-api/csrf";

/* ==================================================
   TYPES — BACKEND CONTRACT
================================================== */

export type LandingBlockType =
  | "hero"
  | "menu"
  | "featured"
  | "hot"
  | "comfort_block"
  | "comfort_rail";

export type AdminLandingBlock = {
  id: number;
  block_type: LandingBlockType;
  ordering: number;
  is_active: boolean;

  hot_category_block_id: number | null;
  comfort_rail_id: number | null;

  created_at: string;
};

/* ==================================================
   PAYLOAD TYPES
================================================== */

export type AdminLandingBlockCreatePayload = {
  block_type: LandingBlockType;
  ordering?: number;
  is_active?: boolean;

  hot_category_block_id?: number | null;
  comfort_rail_id?: number | null;
};

export type AdminLandingBlockUpdatePayload = {
  ordering?: number;
  is_active?: boolean;

  hot_category_block_id?: number | null;
  comfort_rail_id?: number | null;
};

export type AdminLandingBlockReorderItem = {
  id: number;
  ordering: number;
};

/* ==================================================
   INTERNAL CONSTANTS
================================================== */

const BASE_URL = `${API_BASE}/api/admin/cms/landing-blocks/`;

/* ==================================================
   INTERNAL HELPERS
================================================== */

/**
 * Django-safe mutation headers
 */
function mutationHeaders(): HeadersInit {
  const csrf = getCSRFToken();

  return {
    "Content-Type": "application/json",
    ...(csrf ? { "X-CSRFToken": csrf } : {}),
  };
}

/**
 * Narrow DRF-style error objects
 */
function isErrorWithDetail(
  value: unknown
): value is { detail: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "detail" in value &&
    typeof (value as Record<string, unknown>).detail === "string"
  );
}

/**
 * Unified response handler
 * - Safe JSON parsing
 * - Exact backend error propagation
 */
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await safeJson<unknown>(res);

  if (!res.ok) {
    if (isErrorWithDetail(data)) {
      throw new Error(data.detail);
    }

    throw new Error(await parseErrorResponse(res));
  }

  return data as T;
}

/* ==================================================
   API — LANDING BLOCKS
================================================== */

/**
 * GET — List landing blocks
 */
export async function fetchAdminLandingBlocks(): Promise<
  AdminLandingBlock[]
> {
  const res = await fetch(BASE_URL, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "GET",
  });

  const data = await handleResponse<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid landing blocks response");
  }

  return data as AdminLandingBlock[];
}

/**
 * POST — Create landing block
 */
export async function createAdminLandingBlock(
  payload: AdminLandingBlockCreatePayload
): Promise<AdminLandingBlock> {
  const res = await fetch(BASE_URL, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "POST",
    headers: mutationHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<AdminLandingBlock>(res);
}

/**
 * PATCH — Update landing block
 */
export async function updateAdminLandingBlock(
  id: number,
  payload: AdminLandingBlockUpdatePayload
): Promise<AdminLandingBlock> {
  if (!Number.isFinite(id)) {
    throw new Error("LandingBlock id is required");
  }

  const res = await fetch(`${BASE_URL}${id}/`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "PATCH",
    headers: mutationHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<AdminLandingBlock>(res);
}

/**
 * DELETE — Remove landing block
 */
export async function deleteAdminLandingBlock(
  id: number
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("LandingBlock id is required");
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

/**
 * POST — Reorder landing blocks (atomic)
 */
export async function reorderAdminLandingBlocks(
  items: AdminLandingBlockReorderItem[]
): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Reorder payload must be a non-empty array");
  }

  const res = await fetch(`${BASE_URL}reorder/`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: "POST",
    headers: mutationHeaders(),
    body: JSON.stringify(items),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
