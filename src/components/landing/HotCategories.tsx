"use client";

import Link from "next/link";
import styles from "./HotCategories.module.css";

/**
 * ==================================================
 * HOT CATEGORIES — LANDING SECTION (CMS BLOCK)
 * ==================================================
 *
 * ✔ Renders ONE hot-category CMS block
 * ✔ Fully CMS-driven
 * ✔ Zero unsafe access
 * ✔ Strictly typed
 * ✔ Scales to unlimited blocks
 * ✔ NO TITLE (as requested)
 */

import type { HotCategory } from "@/types/hot-category";

/* ==================================================
   TYPES
================================================== */

export type HotCategoryBlock = {
  id: number;
  title?: string; // kept for CMS, not rendered
  ordering: number;
  is_active: boolean;
  items: HotCategory[];
};

/* ==================================================
   PROPS
================================================== */

type Props = {
  block: HotCategoryBlock;
};

/* ==================================================
   COMPONENT
================================================== */

export default function HotCategories({ block }: Props) {
  // CMS hard guards
  if (!block?.is_active) return null;
  if (!Array.isArray(block.items) || block.items.length === 0) return null;

  return (
    <section
      className={styles.section}
      aria-label="Hot categories"
    >
      <div className={styles.grid}>
        {block.items.map((item) => (
          <Link
            key={item.id}
            href={`/category/${item.slug}`}
            className={styles.card}
            aria-label={item.name}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className={styles.image}
              />
            ) : (
              <div
                className={styles.imagePlaceholder}
                aria-hidden="true"
              />
            )}

            <span className={styles.title}>{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
