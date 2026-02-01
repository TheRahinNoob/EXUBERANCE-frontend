// ==================================================
// ADMIN HOT CATEGORY BLOCKS API — CANONICAL
// ==================================================
//
// Mirrors Django Admin: HotCategoryBlockAdmin
// Consumed by Next.js Admin Panel
//
// Guarantees:
// - Session auth + CSRF (centralized)
// - Explicit failures
// - Backend is final authority
//

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
  adminFetch,
} from "../config";

import {
  safeJson,
  parseErrorResponse,
} from "../helpers";

/* ==================================================
   TYPES — CANONICAL CMS CONTRACTS
================================================== */

export type AdminHotCategoryBlockItem = {
  id: number;
  ordering: number;
  is_active: boolean;
  hot_category: {
    id: number;
    image: string | null;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  };
};

export type AdminHotCategoryBlock = {
  id: number;
  title: string | null;
  is_active: boolean;
  ordering: number;
};

export type AdminHotCategoryBlockDetail = AdminHotCategoryBlock & {
  items: AdminHotCategoryBlockItem[];
};

export type AdminHotCategoryBlockPayload = {
  title?: string;
  is_active?: boolean;
  ordering?: number;
};

export type AdminHotCategoryBlockItemReorderPayload = {
  items: {
    id: number;
    ordering: number;
    is_active: boolean;
  }[];
};

export type AdminHotCategoryBlockItemCreateResponse =
  AdminHotCategoryBlockItem;

/* ==================================================
   INTERNAL GUARDS
================================================== */

function assertId(
  value: unknown,
  label: string
): asserts value is number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

/* ==================================================
   BLOCKS — LIST
================================================== */

export async function fetchAdminHotCategoryBlocks(): Promise<
  AdminHotCategoryBlock[]
> {
  const res = await fetch(
    `${API_BASE}/api/admin/cms/hot-category-blocks/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch hot category blocks (${res.status})`
    );
  }

  const data = await safeJson<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid hot category block list response");
  }

  return data as AdminHotCategoryBlock[];
}

/* ==================================================
   BLOCK — DETAIL
================================================== */

export async function fetchAdminHotCategoryBlock(
  id: number
): Promise<AdminHotCategoryBlockDetail> {
  assertId(id, "block id");

  const res = await fetch(
    `${API_BASE}/api/admin/cms/hot-category-blocks/${id}/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch hot category block (${res.status})`
    );
  }

  return safeJson<AdminHotCategoryBlockDetail>(res);
}

/* ==================================================
   BLOCK — CREATE
================================================== */

export async function createAdminHotCategoryBlock(
  payload: AdminHotCategoryBlockPayload
): Promise<AdminHotCategoryBlock> {
  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-category-blocks/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return safeJson<AdminHotCategoryBlock>(res);
}

/* ==================================================
   BLOCK — UPDATE
================================================== */

export async function updateAdminHotCategoryBlock(
  id: number,
  payload: AdminHotCategoryBlockPayload
): Promise<AdminHotCategoryBlock> {
  assertId(id, "block id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-category-blocks/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return safeJson<AdminHotCategoryBlock>(res);
}

/* ==================================================
   BLOCK — DELETE
================================================== */

export async function deleteAdminHotCategoryBlock(
  id: number
): Promise<void> {
  assertId(id, "block id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-category-blocks/${id}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   BLOCK ITEM — CREATE
================================================== */

export async function createAdminHotCategoryBlockItem(
  blockId: number,
  hotCategoryId: number
): Promise<AdminHotCategoryBlockItemCreateResponse> {
  assertId(blockId, "block id");
  assertId(hotCategoryId, "hot category id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-category-blocks/${blockId}/items/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hot_category_id: hotCategoryId,
      }),
    }
  );

  return safeJson<AdminHotCategoryBlockItemCreateResponse>(res);
}

/* ==================================================
   BLOCK ITEM — DELETE
================================================== */

export async function deleteAdminHotCategoryBlockItem(
  blockId: number,
  itemId: number
): Promise<void> {
  assertId(blockId, "block id");
  assertId(itemId, "block item id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-category-blocks/${blockId}/items/${itemId}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   BLOCK ITEM — REORDER
================================================== */

export async function reorderAdminHotCategoryBlockItems(
  blockId: number,
  payload: AdminHotCategoryBlockItemReorderPayload
): Promise<void> {
  assertId(blockId, "block id");

  const res = await adminFetch(
    `${API_BASE}/api/admin/cms/hot-category-blocks/${blockId}/items/reorder/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
