// ==================================================
// ADMIN PRODUCT ATTRIBUTES API (CANONICAL)
// ==================================================
//
// Rules:
// - Backend is the single source of truth
// - NO manual CSRF handling
// - ALL mutations go through adminFetch
// - GET requests may use fetch directly
//

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
  adminFetch,
} from "./config";

import {
  safeJson,
  parseErrorResponse,
} from "./helpers";

/* ==================================================
   TYPES — ATTRIBUTE DEFINITIONS (GLOBAL)
================================================== */

export type AdminProductAttributeDefinition = {
  id: number;
  name: string;
  ordering: number;
};

/* ==================================================
   TYPES — ATTRIBUTE VALUES (PER PRODUCT)
================================================== */

export type AdminProductAttributeValue = {
  id: number;
  attribute_id: number;
  attribute_name: string;
  value: string;
  ordering: number;
};

/* ==================================================
   ATTRIBUTE DEFINITIONS (GLOBAL)
================================================== */

/**
 * GET — List attribute definitions
 */
export async function fetchAdminAttributeDefinitions(): Promise<
  AdminProductAttributeDefinition[]
> {
  const res = await fetch(
    `${API_BASE}/api/admin/attribute-definitions/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error("Failed to load attribute definitions");
  }

  const raw: unknown = await safeJson(res);

  if (Array.isArray(raw)) {
    return raw as AdminProductAttributeDefinition[];
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    "items" in raw &&
    Array.isArray((raw as any).items)
  ) {
    return (raw as any).items as AdminProductAttributeDefinition[];
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    "results" in raw &&
    Array.isArray((raw as any).results)
  ) {
    return (raw as any).results as AdminProductAttributeDefinition[];
  }

  throw new Error("Invalid attribute definition response");
}

/**
 * POST — Create attribute definition
 */
export async function createAdminAttributeDefinition(payload: {
  name: string;
  ordering?: number;
}): Promise<AdminProductAttributeDefinition> {
  if (!payload.name?.trim()) {
    throw new Error("Attribute name is required");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/attribute-definitions/`,
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

  return safeJson(res);
}

/**
 * PATCH — Update attribute definition
 */
export async function updateAdminAttributeDefinition(
  id: number,
  payload: {
    name?: string;
    ordering?: number;
  }
): Promise<AdminProductAttributeDefinition> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid attribute definition id");
  }

  if (
    payload.name === undefined &&
    payload.ordering === undefined
  ) {
    throw new Error("Nothing to update");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/attribute-definitions/${id}/`,
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

  return safeJson(res);
}

/**
 * DELETE — Remove attribute definition
 */
export async function deleteAdminAttributeDefinition(
  id: number
): Promise<void> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid attribute definition id");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/attribute-definitions/${id}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/* ==================================================
   ATTRIBUTE VALUES (PER PRODUCT)
================================================== */

/**
 * GET — List attribute values for a product
 */
export async function fetchAdminProductAttributes(
  productId: number
): Promise<AdminProductAttributeValue[]> {
  if (!Number.isFinite(productId)) {
    throw new Error("Invalid product id");
  }

  const res = await fetch(
    `${API_BASE}/api/admin/products/${productId}/attributes/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error("Failed to load product attributes");
  }

  const raw: unknown = await safeJson(res);

  if (
    typeof raw === "object" &&
    raw !== null &&
    "items" in raw &&
    Array.isArray((raw as any).items)
  ) {
    return (raw as any).items as AdminProductAttributeValue[];
  }

  throw new Error("Invalid product attribute response");
}

/**
 * POST — Create / UPSERT attribute value
 */
export async function createAdminProductAttribute(
  productId: number,
  payload: {
    attribute_id: number;
    value: string;
    ordering?: number;
  }
): Promise<AdminProductAttributeValue> {
  if (!Number.isFinite(productId)) {
    throw new Error("Invalid product id");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${productId}/attributes/`,
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

  return safeJson(res);
}

/**
 * PATCH — Update attribute value
 */
export async function updateAdminProductAttribute(
  pavId: number,
  payload: {
    value?: string;
    ordering?: number;
  }
): Promise<AdminProductAttributeValue> {
  if (!Number.isFinite(pavId)) {
    throw new Error("Invalid product attribute id");
  }

  if (
    payload.value === undefined &&
    payload.ordering === undefined
  ) {
    throw new Error("Nothing to update");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/product-attributes/${pavId}/`,
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

  return safeJson(res);
}

/**
 * DELETE — Remove attribute value
 */
export async function deleteAdminProductAttribute(
  pavId: number
): Promise<void> {
  if (!Number.isFinite(pavId)) {
    throw new Error("Invalid product attribute id");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/product-attributes/${pavId}/`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/**
 * POST — Reorder attribute values
 */
export async function reorderAdminProductAttributes(
  productId: number,
  orderedIds: number[]
): Promise<void> {
  if (!Number.isFinite(productId)) {
    throw new Error("Invalid product id");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/products/${productId}/attributes/reorder/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ordered_ids: orderedIds }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
