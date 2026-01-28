// ==================================================
// ADMIN API CLIENT
// Django session-based authentication + CSRF safe
// ==================================================

import { getCSRFToken } from "./csrf";

// Normalize base URL once
const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000").replace(/\/$/, "");

// ==================================================
// DOMAIN TYPES (BACKEND CONTRACT)
// ==================================================

// ------------------------------
// ORDERS
// ------------------------------
export type AdminOrder = {
  id: number;
  reference: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: string;
  created_at: string;
};

export type AdminOrderItem = {
  id: number;
  product_name: string;
  size: string;
  color: string;
  price: string;
  quantity: number;
  subtotal: string;
};

export type AdminOrderDetail = {
  id: number;
  reference: string;
  status: string;
  total: string;
  created_at: string;
  updated_at: string;

  customer: {
    name: string;
    phone: string;
    address: string;
  };

  items: AdminOrderItem[];
};

export type AdminOrderAuditLog = {
  previous_status: string | null;
  new_status: string;
  actor_type: "admin" | "system";
  actor_identifier: string;
  created_at: string;
};

// ------------------------------
// PRODUCTS (ADMIN – READ ONLY)
// ------------------------------
export type AdminProduct = {
  id: number;
  name: string;
  price: string;
  is_active: boolean;
  total_stock: number;
  created_at: string;
};

// ------------------------------
// PRODUCT DETAIL (ADMIN – READ ONLY)
// ------------------------------
export type AdminProductDetail = {
  id: number;
  name: string;
  slug: string;
  price: string;
  old_price: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;

  variants: {
    id: number;
    size: string;
    color: string;
    stock: number;
  }[];

  attributes: {
    id: number;
    name: string;
    value: string;
    ordering: number;
  }[];
};

// ==================================================
// PAGINATION
// ==================================================

export type PaginationMeta = {
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

// ==================================================
// FILTER TYPES
// ==================================================

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

// ==================================================
// INTERNAL HELPERS
// ==================================================

async function safeJson<T>(res: Response): Promise<T> {
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON response from server");
  }
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return (
      data?.message ||
      data?.detail ||
      data?.error ||
      data?.non_field_errors?.[0] ||
      "Request failed"
    );
  } catch {
    return "Request failed";
  }
}

function buildQuery(
  params?: Record<string, string | number | undefined>
) {
  const query = new URLSearchParams();

  if (!params) return "";

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// ==================================================
// API CALLS
// ==================================================

// --------------------------------------------------
// LIST ORDERS
// --------------------------------------------------
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
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch admin orders (${res.status})`
    );
  }

  const data =
    await safeJson<PaginatedResponse<AdminOrder>>(res);

  if (!Array.isArray(data.items)) {
    throw new Error("Invalid orders response format");
  }

  return data;
}

// --------------------------------------------------
// ORDER DETAIL
// --------------------------------------------------
export async function fetchAdminOrderDetail(
  id: number
): Promise<AdminOrderDetail> {
  const res = await fetch(
    `${API_BASE}/api/admin/orders/${id}/`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch order (${res.status})`
    );
  }

  return safeJson<AdminOrderDetail>(res);
}

// --------------------------------------------------
// ORDER AUDIT TIMELINE
// --------------------------------------------------
export async function fetchAdminOrderAudit(
  id: number
): Promise<AdminOrderAuditLog[]> {
  const res = await fetch(
    `${API_BASE}/api/admin/orders/${id}/audit/`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch order audit (${res.status})`
    );
  }

  const data = await safeJson<AdminOrderAuditLog[]>(res);

  if (!Array.isArray(data)) {
    throw new Error("Invalid audit log response format");
  }

  return data;
}

// --------------------------------------------------
// ORDER STATUS UPDATE
// --------------------------------------------------
export async function updateAdminOrderStatus(
  id: number,
  action: "confirm" | "ship" | "deliver" | "cancel"
): Promise<{ status: string }> {
  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/orders/${id}/status/`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken
          ? { "X-CSRFToken": csrfToken }
          : {}),
      },
      body: JSON.stringify({ action }),
    }
  );

  if (!res.ok) {
    const message = await parseErrorResponse(res);
    throw new Error(message);
  }

  return safeJson<{ status: string }>(res);
}

// --------------------------------------------------
// LIST PRODUCTS (ADMIN – READ ONLY)
// --------------------------------------------------
export async function fetchAdminProducts(params?: {
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AdminProduct>> {
  const query = buildQuery(params);

  const res = await fetch(
    `${API_BASE}/api/admin/products/${query}`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch admin products (${res.status})`
    );
  }

  const data =
    await safeJson<PaginatedResponse<AdminProduct>>(res);

  if (!Array.isArray(data.items)) {
    throw new Error("Invalid products response format");
  }

  return data;
}

// --------------------------------------------------
// PRODUCT DETAIL (ADMIN – READ ONLY)
// --------------------------------------------------
export async function fetchAdminProductDetail(
  id: number
): Promise<AdminProductDetail> {
  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch product (${res.status})`
    );
  }

  return safeJson<AdminProductDetail>(res);
}

// --------------------------------------------------
// PRODUCT ACTIVATE / DEACTIVATE (ADMIN – MUTATION)
// --------------------------------------------------
export async function toggleAdminProductStatus(
  id: number
): Promise<{ id: number; is_active: boolean }> {
  const csrfToken = getCSRFToken();

  const res = await fetch(
    `${API_BASE}/api/admin/products/${id}/status/`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken
          ? { "X-CSRFToken": csrfToken }
          : {}),
      },
    }
  );

  if (!res.ok) {
    const message = await parseErrorResponse(res);
    throw new Error(message);
  }

  return safeJson<{ id: number; is_active: boolean }>(
    res
  );
}
