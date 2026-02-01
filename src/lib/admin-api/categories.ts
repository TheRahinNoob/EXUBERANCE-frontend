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

import { API_BASE, DEFAULT_FETCH_OPTIONS, adminFetch } from "./config";
import { safeJson, parseErrorResponse } from "./helpers";
import type {
  AdminCategory,
  AdminCategoryTreeNode,
} from "./types";

// ✅ Re-export for public API
export type { AdminCategory } from "./types";

/* ==================================================
   INTERNAL RUNTIME VALIDATION
================================================== */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertOptionalString(
  value: unknown,
  field: string
): asserts value is string | null | undefined {
  if (
    value !== undefined &&
    value !== null &&
    typeof value !== "string"
  ) {
    throw new Error(`Invalid ${field}`);
  }
}

function assertOptionalBoolean(
  value: unknown,
  field: string
): asserts value is boolean | undefined {
  if (
    value !== undefined &&
    typeof value !== "boolean"
  ) {
    throw new Error(`Invalid ${field}`);
  }
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
    typeof value.is_campaign !== "boolean" ||
    !Array.isArray(value.children)
  ) {
    throw new Error("Invalid category tree node structure");
  }

  assertOptionalString(value.starts_at, "starts_at");
  assertOptionalString(value.ends_at, "ends_at");
  assertOptionalBoolean(value.show_countdown, "show_countdown");

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
   FETCH FLAT CATEGORY LIST (ADMIN)
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

  // 🔥 Campaign
  is_campaign?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  show_countdown?: boolean;

  // Ordering
  priority?: number;
  ordering?: number;

  // State
  is_active?: boolean;
}): Promise<AdminCategory> {
  if (!payload.name?.trim()) {
    throw new Error("Category name is required");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/categories/`,
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

  return safeJson<AdminCategory>(res);
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

    // 🔥 Campaign
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
): Promise<AdminCategory> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid category id");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/categories/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson<AdminCategory>(res);
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

  const res = await adminFetch(
    `${API_BASE}/api/admin/categories/${id}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
