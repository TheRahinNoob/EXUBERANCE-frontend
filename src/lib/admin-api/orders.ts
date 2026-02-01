// lib/admin-api/orders.ts

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
  adminFetch,
} from "./config";

import {
  buildQuery,
  safeJson,
  parseErrorResponse,
} from "./helpers";

import type {
  AdminOrder,
  AdminOrderDetail,
  AdminOrderAuditLog,
} from "./types";

import type { PaginatedResponse } from "./pagination";

/* ==================================================
   TYPES
================================================== */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderOrdering =
  | "created_at"
  | "-created_at"
  | "status"
  | "-status"
  | "total_price"
  | "-total_price";

/* ==================================================
   FETCH — LIST
================================================== */

export async function fetchAdminOrders(params?: {
  status?: OrderStatus;
  search?: string;
  ordering?: OrderOrdering;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AdminOrder>> {
  const query = buildQuery(params);

  const res = await fetch(
    `${API_BASE}/api/admin/orders/${query}`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch admin orders (${res.status})`
    );
  }

  return safeJson(res);
}

/* ==================================================
   FETCH — DETAIL
================================================== */

export async function fetchAdminOrderDetail(
  id: number
): Promise<AdminOrderDetail> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid order id");
  }

  const res = await fetch(
    `${API_BASE}/api/admin/orders/${id}/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch order (${res.status})`
    );
  }

  return safeJson(res);
}

/* ==================================================
   FETCH — AUDIT
================================================== */

export async function fetchAdminOrderAudit(
  id: number
): Promise<AdminOrderAuditLog[]> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid order id");
  }

  const res = await fetch(
    `${API_BASE}/api/admin/orders/${id}/audit/`,
    DEFAULT_FETCH_OPTIONS
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch order audit (${res.status})`
    );
  }

  return safeJson(res);
}

/* ==================================================
   MUTATION — STATUS TRANSITION
================================================== */

export async function updateAdminOrderStatus(
  id: number,
  action: "confirm" | "ship" | "deliver" | "cancel"
): Promise<AdminOrderDetail> {
  if (!Number.isFinite(id)) {
    throw new Error("Invalid order id");
  }

  const res = await adminFetch(
    `${API_BASE}/api/admin/orders/${id}/status/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    }
  );

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  return safeJson(res);
}
