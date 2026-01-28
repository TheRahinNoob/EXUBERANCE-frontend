/**
 * ==================================================
 * ADMIN API — PUBLIC BARREL EXPORT
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
} from "./config";

export {
  safeJson,
  parseErrorResponse,
  buildQuery,
} from "./helpers";

export type {
  PaginationMeta,
  PaginatedResponse,
} from "./pagination";

/* ==================================================
   DOMAIN TYPES (STRICT BACKEND CONTRACTS)
================================================== */

export type {
  // -------- PRODUCTS --------
  AdminProduct,
  AdminProductDetail,
  AdminProductVariant,
  AdminProductAttribute,
  AdminProductImage,

  // -------- CATEGORIES --------
  AdminCategory,
  AdminCategoryTreeNode,
} from "./types";

/* ==================================================
   ORDERS — ADMIN (READ + STATE MACHINE)
================================================== */

export {
  fetchAdminOrders,
  fetchAdminOrderDetail,
  updateAdminOrderStatus,
  fetchAdminOrderAudit,
} from "./orders";

/* ==================================================
   PRODUCTS — ADMIN CORE (CANONICAL)
================================================== */

export {
  // 📄 LIST & READ
  fetchAdminProducts,
  fetchAdminProductDetail,

  // 🆕 CREATE (MINIMAL PRODUCT SHELL)
  createAdminProduct,

  // 🔒 BASIC IDENTITY (NAME / SLUG)
  updateAdminProductBasicInfo,

  // 💰 COMMERCIAL STATE (PRICE / FLAGS)
  updateAdminProduct,

  // 📝 CMS CONTENT (RICH HTML)
  updateAdminProductDescription,

  // 🔁 ACTIVE / INACTIVE TOGGLE
  toggleAdminProductStatus,
} from "./products";

export type {
  AdminProductStatusToggleResponse,
  AdminProductUpdateResponse,
  AdminProductBasicInfoUpdateResponse,
  AdminProductDescriptionUpdateResponse,
} from "./products";

/* ==================================================
   CATEGORIES — ADMIN
================================================== */

export {
  fetchAdminCategoryTree,
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
   CMS — LANDING PAGE COMPOSITION
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
} from "./cms/featured-categories";

export type {
  AdminFeaturedCategory,
  AdminFeaturedCategoryPayload,
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
} from "./cms/comfort-rails";

export type {
  AdminComfortCategoryRail,
  AdminComfortCategoryRailPayload,
} from "./cms/comfort-rails";
