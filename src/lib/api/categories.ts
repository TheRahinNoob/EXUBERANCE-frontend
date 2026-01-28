import { API_BASE } from "./config";
import type { Category } from "./types";
import { normalizeCategory } from "./normalizers";

/**
 * ==================================================
 * PUBLIC CATEGORY API
 * ==================================================
 *
 * ⚠️ PUBLIC ENDPOINTS ONLY
 * - NO auth
 * - NO cookies
 * - NO CSRF
 */

const BASE = `${API_BASE}/api/categories`;

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch category tree");
  }

  const data = await res.json();

  return Array.isArray(data)
    ? data.map(normalizeCategory)
    : [];
}

export async function getCategoryCards(): Promise<Category[]> {
  const res = await fetch(`${BASE}/cards/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch category cards");
  }

  const data = await res.json();

  return Array.isArray(data)
    ? data.map(normalizeCategory)
    : [];
}

export async function getCategoryDetail(
  slug: string
): Promise<Category | null> {
  const res = await fetch(`${BASE}/${slug}/`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();
  return normalizeCategory(data);
}
