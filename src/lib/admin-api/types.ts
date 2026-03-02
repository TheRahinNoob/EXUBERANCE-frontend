// src/lib/admin-api/types.ts

/* ==================================================
   ORDERS — ADMIN
================================================== */
/* ==================================================
   ORDER STATUS (SINGLE SOURCE OF TRUTH)
================================================== */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type AdminOrderItem = {
  id: number;
  product_name: string;
  size: string;
  color: string;
  price: string;
  quantity: number;
  subtotal: string;
};

export type AdminOrder = {
  id: number;
  reference: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: string;
  created_at: string;

  /**
   * Optional line items returned by:
   * - GET /api/admin/orders/ (list) ✅ (we added on backend)
   *
   * Keep optional to remain backward-compatible in case
   * older environments / caches still serve without items.
   */
  items?: AdminOrderItem[];
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

/* ==================================================
   CATEGORIES — ADMIN (SINGLE SOURCE OF TRUTH)
================================================== */

/**
 * Flat admin category representation.
 *
 * Returned by:
 * - GET /api/admin/categories/
 * - POST / PATCH responses
 *
 * Used for:
 * - Parent dropdowns
 * - Edit modals
 * - Campaign configuration
 * - Reactivation
 */
export type AdminCategory = {
  /* =============================
     CORE IDENTITY
  ============================= */

  id: number;
  name: string;
  slug: string;

  /** Parent category (null = root) */
  parent_id: number | null;

  /* =============================
     ORDERING / VISIBILITY
  ============================= */

  /** Ordering within same parent */
  ordering: number;

  /** Higher priority floats up */
  priority: number;

  /** Soft visibility control (ADMIN ONLY) */
  is_active: boolean;

  /* =============================
     🔥 CAMPAIGN / PROMOTION
  ============================= */

  /** Marks category as a campaign / offer */
  is_campaign: boolean;

  /** Campaign start datetime (ISO-8601) */
  starts_at: string | null;

  /** Campaign end datetime (ISO-8601) */
  ends_at: string | null;

  /** Whether frontend may show countdown timer */
  show_countdown: boolean;
};

/**
 * Recursive category tree node (ADMIN TREE VIEW)
 *
 * Returned by:
 * - GET /api/admin/categories/tree/
 *
 * Purpose:
 * - Visual hierarchy
 * - Drag & drop reorder
 * - Campaign badges
 */
export type AdminCategoryTreeNode = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;

  // State
  is_active: boolean;

  // 🔥 Campaign
  is_campaign: boolean;
  starts_at: string | null;
  ends_at: string | null;
  show_countdown: boolean;

  // Tree
  children: AdminCategoryTreeNode[];
};

/* ==================================================
   PRODUCTS — ADMIN (LIST)
================================================== */

export type AdminProduct = {
  id: number;
  name: string;
  price: string;
  is_active: boolean;
  total_stock: number;
  created_at: string;
};

/* ==================================================
   PRODUCT SUB-TYPES (REUSABLE)
================================================== */

export type AdminProductVariant = {
  id: number;
  size: string;
  color: string;
  stock: number;
};

export type AdminProductAttribute = {
  id: number;
  name: string;
  value: string;
  ordering: number;
};

export type AdminProductImage = {
  id: number;
  image: string; // absolute URL
  alt_text: string;
  is_primary: boolean;
  ordering: number;
  created_at: string;
};

/* ==================================================
   PRODUCT DETAIL — SINGLE SOURCE OF TRUTH
================================================== */

export type AdminProductDetail = {
  id: number;
  name: string;
  slug: string;

  /** 🔥 Rich HTML product description (Admin CMS) */
  description: string;

  /* =============================
     PRICING
  ============================= */

  price: number | string;
  old_price: number | string | null;

  /* =============================
     FLAGS
  ============================= */

  is_active: boolean;
  is_featured: boolean;

  /* =============================
     MEDIA
  ============================= */

  main_image: string | null;

  /* =============================
     META
  ============================= */

  created_at: string;
  updated_at: string;

  /* =============================
     RELATIONS
  ============================= */

  images: AdminProductImage[];
  variants: AdminProductVariant[];
  attributes: AdminProductAttribute[];

  /**
   * Categories assigned to this product.
   *
   * Flat list — hierarchy handled separately
   * via AdminCategoryTreeNode API.
   */
  categories: AdminCategory[];
};