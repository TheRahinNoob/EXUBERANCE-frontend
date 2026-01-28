import { API_BASE } from "./config";
import type {
  Product,
  ProductDetail,
  ProductVariant,
  ProductAttribute,
} from "@/types/product";
import { normalizeMediaUrl } from "./normalizers";

/* ==================================================
   INTERNAL SAFE FETCH
   - Never crashes UI
   - Logs once
================================================== */
async function safeFetch<T>(url: string): Promise<T | null> {
  let res: Response;

  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    console.error("[Products API] Network error:", url, err);
    return null;
  }

  if (!res.ok) {
    console.error(
      "[Products API] HTTP error:",
      res.status,
      res.statusText,
      url
    );
    return null;
  }

  try {
    return (await res.json()) as T;
  } catch (err) {
    console.error("[Products API] Invalid JSON:", url, err);
    return null;
  }
}

/* ==================================================
   RAW BACKEND TYPES (INTERNAL)
================================================== */
type APIProductVariant = {
  id: number;
  size: string;
  color: string;
  stock: number;
};

type APIProductImage = {
  id: number;
  image: string;
};

type APIProductAttribute = {
  name: string;
  value: string;
};

type APIProduct = {
  id: number;
  slug: string;
  name: string;

  short_description?: string;
  description?: string;

  price: string;              // DecimalField (KEEP STRING)
  old_price: string | null;

  main_image: string;

  images?: APIProductImage[];
  variants?: APIProductVariant[];
  attributes?: APIProductAttribute[];

  is_featured?: boolean;
};

/* ==================================================
   PRODUCT LIST
================================================== */
export async function getProducts(params?: {
  category?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  const query = new URLSearchParams();

  if (params?.category) query.set("category", params.category);
  if (params?.featured) query.set("featured", "1");
  if (params?.search) query.set("q", params.search);
  if (params?.limit !== undefined)
    query.set("limit", String(params.limit));

  const url = query.toString()
    ? `${API_BASE}/api/products/?${query.toString()}`
    : `${API_BASE}/api/products/`;

  const data = await safeFetch<APIProduct[]>(url);

  if (!Array.isArray(data)) return [];

  return data.map(normalizeProduct);
}

/* ==================================================
   PRODUCT DETAIL (PDP)
================================================== */
export async function getProduct(
  slug: string
): Promise<ProductDetail | null> {
  const raw = await safeFetch<APIProduct>(
    `${API_BASE}/api/products/${slug}/`
  );

  if (!raw) return null;

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,

    // 🔥 KEEP DECIMAL STRINGS — UI decides formatting
    price: raw.price,
    old_price: raw.old_price ?? null,

    main_image: normalizeMediaUrl(raw.main_image),

    short_description: raw.short_description ?? "",
    description: raw.description ?? "",

    variants: Array.isArray(raw.variants)
      ? raw.variants.map(
          (v): ProductVariant => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
          })
        )
      : [],

    attributes: Array.isArray(raw.attributes)
      ? raw.attributes.map(
          (a): ProductAttribute => ({
            label: a.name,
            value: a.value,
          })
        )
      : [],

    images: Array.from(
      new Set(
        [
          normalizeMediaUrl(raw.main_image),
          ...(Array.isArray(raw.images)
            ? raw.images.map((img) =>
                normalizeMediaUrl(img.image)
              )
            : []),
        ].filter(
          (img): img is string =>
            typeof img === "string" && img.length > 0
        )
      )
    ),
  };
}

/* ==================================================
   RELATED PRODUCTS
================================================== */
export async function getRelatedProducts(
  slug: string,
  limit = 8
): Promise<Product[]> {
  const data = await safeFetch<APIProduct[]>(
    `${API_BASE}/api/products/${slug}/related/?limit=${limit}`
  );

  if (!Array.isArray(data)) return [];

  return data.map(normalizeProduct);
}

/* ==================================================
   NORMALIZER (AUTHORITATIVE)
================================================== */
function normalizeProduct(raw: APIProduct): Product {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,

    // 🔒 Decimal safety
    price: raw.price,
    old_price: raw.old_price ?? null,

    main_image: normalizeMediaUrl(raw.main_image),

    short_description: raw.short_description ?? "",
    is_featured: raw.is_featured ?? false,
  };
}
