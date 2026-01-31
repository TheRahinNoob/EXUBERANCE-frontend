import { API_BASE } from "./config";
import type { APICategory } from "./types";
import { normalizeCategory } from "./normalizers";

/**
 * ==================================================
 * PUBLIC CATEGORY API
 * ==================================================
 *
 * ✅ PUBLIC ENDPOINTS ONLY
 * - NO auth
 * - NO cookies
 * - NO CSRF
 * - NO admin contracts
 *
 * Architecture:
 * Backend (APICategory)
 *        ↓
 * Normalizer
 *        ↓
 * UI Category
 */

/* ==================================================
   UI TYPE (LOCAL, NOT BACKEND CONTRACT)
================================================== */

/**
 * UI-safe Category shape.
 * This MUST NOT live in `types.ts`.
 */
export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;

  is_campaign?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  show_countdown?: boolean;

  children?: Category[];
};

const BASE = `${API_BASE}/api/categories`;

/* ==================================================
   FETCH CATEGORY TREE
================================================== */

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch category tree");
  }

  const data: unknown = await res.json();

  if (!Array.isArray(data)) return [];

  return (data as APICategory[]).map(normalizeCategory);
}

/* ==================================================
   FETCH CATEGORY CARDS
================================================== */

export async function getCategoryCards(): Promise<Category[]> {
  const res = await fetch(`${BASE}/cards/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch category cards");
  }

  const data: unknown = await res.json();

  if (!Array.isArray(data)) return [];

  return (data as APICategory[]).map(normalizeCategory);
}

/* ==================================================
   FETCH CATEGORY DETAIL
================================================== */

export async function getCategoryDetail(
  slug: string
): Promise<Category | null> {
  const res = await fetch(`${BASE}/${slug}/`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data: unknown = await res.json();

  return normalizeCategory(data as APICategory);
}
