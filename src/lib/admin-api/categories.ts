// ==================================================
// ADMIN CATEGORY API — SINGLE SOURCE OF TRUTH
// ==================================================
//
// Backend controls:
// - hierarchy
// - campaign logic
// - visibility
//
// Frontend controls:
// - UI only
// - NEVER infers business rules
//

import { API_BASE, DEFAULT_FETCH_OPTIONS } from "./config";
import { getCSRFToken } from "./csrf";
import { safeJson, parseErrorResponse } from "./helpers";
import type {
  AdminCategory,
  AdminCategoryTreeNode,
} from "./types";

// 🔥 RE-EXPORT FOR PUBLIC API (THIS FIXES YOUR ERROR)
export type { AdminCategory } from "./types";

/* ==================================================
   INTERNAL RUNTIME VALIDATION
================================================== */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertCategoryTreeNode(
  value: unknown
): asserts value is AdminCategoryTreeNode {
  if (!isObject(value)) {
    throw new Error("Invalid category tree node");
  }

  if (
    typeof value.id !== "number" ||
    typeof value.name !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.is_active !== "boolean" ||
    !Array.isArray(value.children)
  ) {
    throw new Error("Invalid category tree node structure");
  }

  for (const child of value.children) {
    assertCategoryTreeNode(child);
  }
}

/* ==================================================
   FETCH CATEGORY TREE (ADMIN)
================================================== */

export async function fetchAdminCategoryTree(): Promise<
  AdminCategoryTreeNode[]
> {
  const res = await fetch(
    `${API_BASE}/api/admin/categories/tree/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch category tree (${res.status})`
    );
  }

  const data = await safeJson<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid category tree response");
  }

  for (const node of data) {
    assertCategoryTreeNode(node);
  }

  return data;
}

/* ==================================================
   FETCH FLAT CATEGORY LIST (ADMIN — ALL)
================================================== */

export async function fetchAdminCategories(): Promise<
  AdminCategory[]
> {
  const res = await fetch(
    `${API_BASE}/api/admin/categories/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch categories (${res.status})`
    );
  }

  const data = await safeJson<unknown>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid admin category list response");
  }

  return data as AdminCategory[];
}

/* ==================================================
   CREATE CATEGORY (ADMIN)
================================================== */

export async function createAdminCategory(payload: {
  name: string;
  slug?: string;
  parent_id?: number | null;

  // 🔥 CAMPAIGN
  is_campaign?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  show_countdown?: boolean;

  // Ordering
  priority?: number;
  ordering?: number;

  // State
  is_active?: boolean;
}) {
  if (!payload.name?.trim()) {
    throw new Error("Category name is required");
  }

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/categories/`,
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
   UPDATE CATEGORY (ADMIN)
================================================== */

export async function updateAdminCategory(
  id: number,
  payload: {
    name?: string;
    slug?: string;
    parent_id?: number | null;

    // 🔥 CAMPAIGN
    is_campaign?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
    show_countdown?: boolean;

    // Ordering
    priority?: number;
    ordering?: number;

    // State
    is_active?: boolean;
  }
) {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid category id");
  }

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/categories/${id}/`,
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
   DELETE CATEGORY (ADMIN)
================================================== */

export async function deleteAdminCategory(
  id: number
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid category id");
  }

  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/categories/${id}/`,
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
