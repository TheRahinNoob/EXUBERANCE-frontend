/* ==================================================
   SEARCH API — SINGLE SOURCE OF TRUTH
================================================== */

/**
 * IMPORTANT ARCHITECTURAL RULE:
 * --------------------------------------------------
 * - API_BASE NEVER includes `/api`
 * - `/api` belongs to endpoint paths only
 */

const API_BASE: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000";

const MEDIA_BASE: string =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ??
  "http://127.0.0.1:8000";

/* ==================================================
   TYPES — STRICT & SAFE
================================================== */

export type SearchProductsParams = {
  q?: string;
  page?: number;

  categories?: string[];
  category?: string; // legacy support
  offer?: string; // legacy support

  min_price?: number;
  max_price?: number;

  ordering?: "price_asc" | "price_desc" | "newest";
};

export type SearchProductsResponse<T = any> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/* ==================================================
   HELPERS
================================================== */

function normalizeMediaUrl(
  path?: string | null
): string | null {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return path.startsWith("/")
    ? `${MEDIA_BASE}${path}`
    : `${MEDIA_BASE}/${path}`;
}

/**
 * 🔥 PRODUCT NORMALIZER
 * - Keeps DecimalFields as strings
 * - Never drops fields
 */
function normalizeProduct(product: any) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,

    price: product.price,
    old_price:
      product.old_price !== undefined &&
      product.old_price !== null &&
      product.old_price !== ""
        ? product.old_price
        : null,

    main_image: normalizeMediaUrl(
      product.main_image || product.image
    ),
  };
}

/* ==================================================
   SEARCH PRODUCTS — AUTHORITATIVE
================================================== */

export async function searchProducts(
  params: SearchProductsParams
): Promise<SearchProductsResponse> {
  const query = new URLSearchParams();

  /* -------------------------------
     TEXT SEARCH
  -------------------------------- */
  if (params.q?.trim()) {
    query.set("q", params.q.trim());
  }

  /* -------------------------------
     PAGINATION
  -------------------------------- */
  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  /* -------------------------------
     CATEGORY NORMALIZATION
  -------------------------------- */
  const categories = new Set<string>();

  params.categories?.forEach((c) => {
    if (c?.trim()) categories.add(c.trim());
  });

  if (params.category?.trim()) {
    categories.add(params.category.trim());
  }

  if (params.offer?.trim()) {
    categories.add(params.offer.trim());
  }

  if (categories.size > 0) {
    query.set(
      "categories",
      Array.from(categories).join(",")
    );
  }

  /* -------------------------------
     PRICE FILTERS
  -------------------------------- */
  if (typeof params.min_price === "number") {
    query.set("min_price", String(params.min_price));
  }

  if (typeof params.max_price === "number") {
    query.set("max_price", String(params.max_price));
  }

  /* -------------------------------
     ORDERING
  -------------------------------- */
  if (params.ordering) {
    query.set("ordering", params.ordering);
  }

  /* -------------------------------
     REQUEST
  -------------------------------- */
  const url = `${API_BASE}/api/search/?${query.toString()}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  /* -------------------------------
     SAFE FAILS
  -------------------------------- */
  if (res.status === 404) {
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }

  if (!res.ok) {
    console.error("Search API error", {
      status: res.status,
      url,
    });
    throw new Error("Failed to fetch products");
  }

  const data = await res.json();

  return {
    count: Number(data.count) || 0,
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: Array.isArray(data.results)
      ? data.results.map(normalizeProduct)
      : [],
  };
}
