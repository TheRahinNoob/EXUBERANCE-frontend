/**
 * ==================================================
 * ADMIN CMS API — LANDING BLOCKS (CANONICAL)
 * ==================================================
 *
 * RULES:
 * - Backend is the SINGLE source of truth
 * - Frontend enums MUST match Django enums EXACTLY
 * - No guessing, no aliases, no silent coercion
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
   TYPES — BACKEND CONTRACT (LOCKED)
================================================== */

/**
 * 🔒 MUST MATCH Django LandingBlock.BlockType EXACTLY
 */
export type LandingBlockType =
  | "hero"
  | "menu"
  | "featured"
  | "hot"
  | "comfort_block"
  | "comfort_rail";

/**
 * READ MODEL
 */
export type AdminLandingBlock = {
  id: number;
  block_type: LandingBlockType;

  ordering: number;
  is_active: boolean;

  hot_category_block_id: number | null;
  comfort_rail_id: number | null;
  comfort_editorial_block_id: number | null;

  created_at: string;
};

/* ==================================================
   PAYLOAD TYPES — WRITE MODELS
================================================== */

export type AdminLandingBlockCreatePayload = {
  block_type: LandingBlockType;

  ordering?: number;
  is_active?: boolean;

  hot_category_block_id?: number | null;
  comfort_rail_id?: number | null;
  comfort_editorial_block_id?: number | null;
};

export type AdminLandingBlockUpdatePayload = {
  ordering?: number;
  is_active?: boolean;

  hot_category_block_id?: number | null;
  comfort_rail_id?: number | null;
  comfort_editorial_block_id?: number | null;
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

function isErrorWithDetail(
  value: unknown
): value is { detail: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "detail" in value &&
    typeof (value as any).detail === "string"
  );
}

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

export async function createAdminLandingBlock(
  payload: AdminLandingBlockCreatePayload
): Promise<AdminLandingBlock> {
  const res = await adminFetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AdminLandingBlock>(res);
}

export async function updateAdminLandingBlock(
  id: number,
  payload: AdminLandingBlockUpdatePayload
): Promise<AdminLandingBlock> {
  if (!Number.isFinite(id)) {
    throw new Error("LandingBlock id is required");
  }

  const res = await adminFetch(`${BASE_URL}${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AdminLandingBlock>(res);
}

export async function deleteAdminLandingBlock(
  id: number
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("LandingBlock id is required");
  }

  const res = await adminFetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

export async function reorderAdminLandingBlocks(
  items: AdminLandingBlockReorderItem[]
): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Reorder payload must be a non-empty array");
  }

  const res = await adminFetch(`${BASE_URL}reorder/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(items),
  });

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
