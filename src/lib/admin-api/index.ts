/**
 * ==================================================
 * ADMIN API — PUBLIC BARREL EXPORT (CANONICAL)
 * ==================================================
 *
 * ⚠️ CRITICAL RULES:
 * --------------------------------------------------
 * - THIS IS THE ONLY FILE frontend imports from
 * - NO wildcard exports across domains
 * - Explicit exports only (prevents name collisions)
 * - Backend is the single source of truth
 *
 * PURPOSE:
 * --------------------------------------------------
 * - Stable, auditable admin API surface
 * - Safe refactors without breaking imports
 * - Clear domain ownership
 */

/* ==================================================
   CONFIG & SHARED UTILITIES
================================================== */

export {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
  adminFetch, // ✅ REQUIRED
} from "./config";

export {
  safeJson,
  parseErrorResponse,
  buildQuery,
} from "./helpers";

/* ❌ CSRF helpers are INTERNAL ONLY — NOT EXPORTED */
/* CSRF is handled automatically by adminFetch */

/* ==================================================
   PAGINATION
================================================== */

export type {
  PaginationMeta,
  PaginatedResponse,
} from "./pagination";

/* ==================================================
   DOMAIN TYPES (STRICT BACKEND CONTRACTS)
================================================== */

export type {
  // ================= ORDERS =================
  AdminOrder,
  AdminOrderDetail,
  AdminOrderAuditLog,
  OrderStatus,

  // ================= PRODUCTS =================
  AdminProduct,
  AdminProductDetail,
  AdminProductVariant,
  AdminProductAttribute,
  AdminProductImage,

  // ================= CATEGORIES =================
  AdminCategory,
  AdminCategoryTreeNode,
} from "./types";

/* ==================================================
   ORDERS — ADMIN
================================================== */

export {
  fetchAdminOrders,
  fetchAdminOrderDetail,
  fetchAdminOrderAudit,
  updateAdminOrderStatus,
} from "./orders";

/* ==================================================
   PRODUCTS — ADMIN CORE
================================================== */

export {
  fetchAdminProducts,
  fetchAdminProductDetail,
  createAdminProduct,

  updateAdminProductBasicInfo,
  updateAdminProductDescription,
  updateAdminProduct,

  deactivateAdminProduct,
} from "./products";

export type {
  AdminProductUpdateResponse,
  AdminProductBasicInfoUpdateResponse,
  AdminProductDescriptionUpdateResponse,
  AdminProductDeactivateResponse,
} from "./products";

/* ==================================================
   CATEGORIES — ADMIN
================================================== */

export {
  fetchAdminCategories,
  fetchAdminCategoryTree,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "./categories";

/* ==================================================
   PRODUCT IMAGES — ADMIN
================================================== */

export {
  fetchAdminProductImages,
  uploadAdminProductImage,
  setAdminProductPrimaryImage,
  deleteAdminProductImage,
} from "./product-images";

export type {
  AdminProductImage as AdminProductImageResponse,
} from "./product-images";

/* ==================================================
   CMS — LANDING BLOCKS
================================================== */

export {
  fetchAdminLandingBlocks,
  createAdminLandingBlock,
  updateAdminLandingBlock,
  deleteAdminLandingBlock,
} from "./cms/landing-blocks";

export type {
  AdminLandingBlock,
  AdminLandingBlockCreatePayload,
  AdminLandingBlockUpdatePayload,
  LandingBlockType,
} from "./cms/landing-blocks";

/* ==================================================
   CMS — HERO BANNERS
================================================== */

export {
  fetchAdminHeroBanners,
  createAdminHeroBanner,
  updateAdminHeroBanner,
  deleteAdminHeroBanner,
} from "./cms/hero-banners";

export type {
  AdminHeroBanner,
  AdminHeroBannerCreatePayload,
  AdminHeroBannerUpdatePayload,
} from "./cms/hero-banners";

/* ==================================================
   CMS — LANDING MENU ITEMS
================================================== */

export {
  fetchAdminLandingMenuItems,
  createAdminLandingMenuItem,
  updateAdminLandingMenuItem,
  deleteAdminLandingMenuItem,
} from "./cms/landing-menu-items";

export type {
  AdminLandingMenuItem,
  AdminLandingMenuItemCreatePayload,
  AdminLandingMenuItemUpdatePayload,
} from "./cms/landing-menu-items";

/* ==================================================
   CMS — FEATURED CATEGORIES
================================================== */

export {
  fetchAdminFeaturedCategories,
  createAdminFeaturedCategory,
  updateAdminFeaturedCategory,
  deleteAdminFeaturedCategory,
} from "./cms/featured-categories";

export type {
  AdminFeaturedCategory,
  AdminFeaturedCategoryCreatePayload,
  AdminFeaturedCategoryUpdatePayload,
} from "./cms/featured-categories";

/* ==================================================
   CMS — HOT CATEGORY BLOCKS
================================================== */

export {
  fetchAdminHotCategoryBlocks,
  createAdminHotCategoryBlock,
  updateAdminHotCategoryBlock,
  reorderAdminHotCategoryBlockItems,
} from "./cms/hot-category-blocks";

export type {
  AdminHotCategoryBlock,
  AdminHotCategoryBlockItem,
  AdminHotCategoryBlockPayload,
  AdminHotCategoryBlockItemReorderPayload,
} from "./cms/hot-category-blocks";

/* ==================================================
   CMS — COMFORT CATEGORY RAILS
================================================== */

export {
  fetchAdminComfortRails,
  createAdminComfortRail,
  updateAdminComfortRail,
  deleteAdminComfortRail,
} from "./cms/comfort-rails";

export type {
  AdminComfortCategoryRail,
  AdminComfortCategoryRailUpdatePayload,
} from "./cms/comfort-rails";

/* ==================================================
   CMS — COMFORT EDITORIAL (FINAL)
================================================== */

export {
  fetchAdminComfortEditorialBlocks,
  fetchAdminComfortEditorialBlock,
  createAdminComfortEditorialBlock,
  updateAdminComfortEditorialBlock,
  updateAdminComfortEditorialBlockImage,
  deleteAdminComfortEditorialBlock,
} from "./cms/comfort-editorial";

export type {
  AdminComfortEditorialBlock,
  AdminComfortEditorialBlockCreatePayload,
  AdminComfortEditorialBlockUpdatePayload,
} from "./cms/comfort-editorial";

/* ==================================================
   END OF BARREL (LOCKED)
================================================== */
