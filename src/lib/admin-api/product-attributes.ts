import { API_BASE, DEFAULT_FETCH_OPTIONS } from "./config";
import { safeJson, parseErrorResponse } from "./helpers";
import { getCSRFToken } from "./csrf";

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
   /api/admin/attribute-definitions/
================================================== */

/**
 * GET — List attribute definitions
 *
 * 🔒 Normalized + Type-safe
 * Supports:
 * - Array
 * - { items: [] }
 * - { results: [] }
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
  const csrf = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/attribute-definitions/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return (await safeJson(res)) as AdminProductAttributeDefinition;
}

/**
 * PATCH — Update attribute definition (PARTIAL)
 */
export async function updateAdminAttributeDefinition(
  id: number,
  payload: {
    name?: string;
    ordering?: number;
  }
): Promise<AdminProductAttributeDefinition> {
  const csrf = getCSRFToken();

  if (
    payload.name === undefined &&
    payload.ordering === undefined
  ) {
    throw new Error("Nothing to update");
  }

  const res = await fetch(
    `${API_BASE}/api/admin/attribute-definitions/${id}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return (await safeJson(res)) as AdminProductAttributeDefinition;
}

/**
 * DELETE — Remove attribute definition
 */
export async function deleteAdminAttributeDefinition(
  id: number
): Promise<void> {
  const csrf = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/attribute-definitions/${id}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "DELETE",
      headers: csrf ? { "X-CSRFToken": csrf } : undefined,
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
 * Backend returns: { items: [...] }
 */
export async function fetchAdminProductAttributes(
  productId: number
): Promise<AdminProductAttributeValue[]> {
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
  const csrf = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${productId}/attributes/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return (await safeJson(res)) as AdminProductAttributeValue;
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
  const csrf = getCSRFToken();

  if (
    payload.value === undefined &&
    payload.ordering === undefined
  ) {
    throw new Error("Nothing to update");
  }

  const res = await fetch(
    `${API_BASE}/api/admin/product-attributes/${pavId}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return (await safeJson(res)) as AdminProductAttributeValue;
}

/**
 * DELETE — Remove attribute value
 */
export async function deleteAdminProductAttribute(
  pavId: number
): Promise<void> {
  const csrf = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/product-attributes/${pavId}/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "DELETE",
      headers: csrf ? { "X-CSRFToken": csrf } : undefined,
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}

/**
 * POST — Reorder attribute values (Drag & Drop)
 */
export async function reorderAdminProductAttributes(
  productId: number,
  orderedIds: number[]
): Promise<void> {
  const csrf = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${productId}/attributes/reorder/`,
    {
      ...DEFAULT_FETCH_OPTIONS,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      },
      body: JSON.stringify({ ordered_ids: orderedIds }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
}
