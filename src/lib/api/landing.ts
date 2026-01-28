import { API_BASE } from "./config";
import type {
  ApiBlockResponse,
  HeroBanner,
  LandingMenuItem,
  FeaturedCategory,
  HotCategory,
  ComfortRail,
  LandingCMSBlock,
} from "./types";
import {
  normalizeHeroBanner,
  normalizeMediaUrl,
} from "./normalizers";

/* ==================================================
   INTERNAL SAFE FETCH (PUBLIC API)
================================================== */

async function safeFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${url}`);
  }

  return res.json();
}

/* ==================================================
   HERO BANNERS
================================================== */

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const data = await safeFetch<ApiBlockResponse<any>>(
    `${API_BASE}/api/landing/banners/`
  );

  return Array.isArray(data.items)
    ? data.items.map(normalizeHeroBanner)
    : [];
}

/* ==================================================
   LANDING MENU
================================================== */

export async function getLandingMenu(): Promise<LandingMenuItem[]> {
  const data = await safeFetch<ApiBlockResponse<LandingMenuItem>>(
    `${API_BASE}/api/landing/menu/`
  );

  return Array.isArray(data.items) ? data.items : [];
}

/* ==================================================
   FEATURED CATEGORIES
================================================== */

export async function getFeaturedCategories(): Promise<
  FeaturedCategory[]
> {
  const data = await safeFetch<ApiBlockResponse<any>>(
    `${API_BASE}/api/landing/featured-categories/`
  );

  return Array.isArray(data.items)
    ? data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        image: normalizeMediaUrl(item.image),
      }))
    : [];
}

/* ==================================================
   HOT CATEGORIES
================================================== */

export async function getHotCategories(): Promise<HotCategory[]> {
  const data = await safeFetch<ApiBlockResponse<any>>(
    `${API_BASE}/api/landing/hot-categories/`
  );

  if (!Array.isArray(data.items)) return [];

  return data.items.map((item: any) => ({
    id: item.id,
    hot_category_block_id: item.hot_category_block_id,
    name: item.name,
    slug: item.slug,
    image: normalizeMediaUrl(item.image),
  }));
}

/* ==================================================
   COMFORT RAILS
================================================== */

export async function getComfortRails(): Promise<ComfortRail[]> {
  const data = await safeFetch<ApiBlockResponse<any>>(
    `${API_BASE}/api/landing/comfort/`
  );

  if (!Array.isArray(data.items)) return [];

  return data.items.map((rail: any) => ({
    id: rail.id,

    category: {
      name: rail.category.name,
      slug: rail.category.slug,
      image: normalizeMediaUrl(rail.category.image),
    },

    products: Array.isArray(rail.products)
      ? rail.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          old_price: p.old_price ?? null,
          main_image: normalizeMediaUrl(
            p.main_image || p.image
          ),
        }))
      : [],
  }));
}

/* ==================================================
   CMS — LANDING LAYOUT (PUBLIC)
================================================== */

export async function getLandingCMS(): Promise<
  ApiBlockResponse<LandingCMSBlock>
> {
  return safeFetch<ApiBlockResponse<LandingCMSBlock>>(
    `${API_BASE}/api/landing/cms/`
  );
}
