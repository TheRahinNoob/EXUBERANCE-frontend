"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories } from "@/lib/api";
import styles from "./ShopSidebar.module.css";

/* =========================
   TYPES
========================= */
export type Category = {
  id: number;
  name: string;
  slug: string;
  is_campaign?: boolean;
  count?: number;
  children?: Category[];
};

type AncestorMap = Record<string, string[]>;

/* =========================
   TREE HELPERS
========================= */
function collectSlugs(category: Category): string[] {
  return [
    category.slug,
    ...(category.children?.flatMap(collectSlugs) ?? []),
  ];
}

function buildAncestorMap(categories: Category[]): AncestorMap {
  const map: AncestorMap = {};

  function walk(category: Category, ancestors: string[]) {
    map[category.slug] = ancestors;
    category.children?.forEach((child) =>
      walk(child, [...ancestors, category.slug])
    );
  }

  categories.forEach((cat) => walk(cat, []));
  return map;
}

function expandSelected(
  categories: Category[],
  rawSelected: string[]
): string[] {
  const expanded = new Set(rawSelected);

  function traverse(category: Category) {
    if (rawSelected.includes(category.slug)) {
      collectSlugs(category).forEach((s) =>
        expanded.add(s)
      );
    }
    category.children?.forEach(traverse);
  }

  categories.forEach(traverse);
  return Array.from(expanded);
}

/* =========================
   COMPONENT (PRESENTATION ONLY)
========================= */
export default function ShopSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);

  /* URL = SINGLE SOURCE OF TRUTH */
  const selectedCategories = useMemo(() => {
    return (
      searchParams
        .get("categories")
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? []
    );
  }, [searchParams]);

  const selectedOffer =
    searchParams.get("offer")?.trim() || null;

  /* FETCH CATEGORY TREE */
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const campaignCategories = useMemo(
    () => categories.filter((c) => c.is_campaign),
    [categories]
  );

  const normalCategories = useMemo(
    () => categories.filter((c) => !c.is_campaign),
    [categories]
  );

  const ancestorMap = useMemo(
    () => buildAncestorMap(categories),
    [categories]
  );

  const expandedSelected = useMemo(
    () => expandSelected(categories, selectedCategories),
    [categories, selectedCategories]
  );

  /* =========================
     ACTIONS
  ========================= */
  function toggleCategory(category: Category) {
    const slug = category.slug;
    const ancestors = ancestorMap[slug] ?? [];

    let next: string[];

    if (selectedCategories.includes(slug)) {
      next = selectedCategories.filter((s) => s !== slug);
    } else {
      next = selectedCategories.filter(
        (s) => !ancestors.includes(s)
      );
      next.push(slug);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("offer");

    if (next.length) {
      params.set("categories", next.join(","));
    } else {
      params.delete("categories");
    }

    router.push(`/shop?${params.toString()}`);
  }

  function toggleOffer(slug: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedOffer === slug) {
      params.delete("offer");
    } else {
      params.set("offer", slug);
    }

    params.delete("categories");
    router.push(`/shop?${params.toString()}`);
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <aside className={styles.sidebar}>
      {/* OFFERS */}
      {campaignCategories.length > 0 && (
        <>
          <div className={styles.sectionTitle}>
            Offers
          </div>

          {campaignCategories.map((cat) => (
            <div
              key={cat.id}
              className={styles.row}
              onClick={() => toggleOffer(cat.slug)}
            >
              <input
                type="checkbox"
                checked={selectedOffer === cat.slug}
                readOnly
              />
              <span className={styles.offer}>
                ⚡ {cat.name}
              </span>
              {cat.count !== undefined && (
                <span className={styles.count}>
                  {cat.count}
                </span>
              )}
            </div>
          ))}
        </>
      )}

      {/* CATEGORIES */}
      <div className={styles.sectionTitle}>
        Categories
      </div>

      {normalCategories.map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat}
          expandedSelected={expandedSelected}
          onToggle={toggleCategory}
          level={0}
        />
      ))}
    </aside>
  );
}

/* =========================
   CATEGORY ROW
========================= */
function CategoryRow({
  category,
  expandedSelected,
  onToggle,
  level,
}: {
  category: Category;
  expandedSelected: string[];
  onToggle: (category: Category) => void;
  level: number;
}) {
  const slugs = collectSlugs(category);
  const checked = slugs.every((s) =>
    expandedSelected.includes(s)
  );

  return (
    <>
      <div
        className={`${styles.row} ${styles[`indent-${level}`] ?? ""}`}
        onClick={() => onToggle(category)}
      >
        <input type="checkbox" checked={checked} readOnly />
        <span
          className={
            level === 0 ? styles.parent : styles.child
          }
        >
          {category.name}
        </span>
        {category.count !== undefined && (
          <span className={styles.count}>
            {category.count}
          </span>
        )}
      </div>

      {category.children?.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          expandedSelected={expandedSelected}
          onToggle={onToggle}
          level={level + 1}
        />
      ))}
    </>
  );
}
