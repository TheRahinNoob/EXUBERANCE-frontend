import Link from "next/link";
import styles from "./FeaturedCategories.module.css";

/**
 * ==================================================
 * FEATURED CATEGORIES (CMS-DRIVEN, IMAGE-ONLY)
 * ==================================================
 *
 * ❗ Domain types are owned by API layer
 * ❗ UI never redefines business contracts
 * ❗ This component is PURE PRESENTATION
 */

import type { APIFeaturedCategory } from "@/lib/api/types";

type Props = {
  items: APIFeaturedCategory[];
};

export default function FeaturedCategories({ items }: Props) {
  // Absolute safety guard
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Featured</h2>

      <div className={styles.grid}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/category/${item.slug}`}
            className={styles.card}
            aria-label={item.name} // accessibility preserved
          >
            {/* IMAGE ONLY — NO NAME */}
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
              />
            ) : (
              <div
                className={styles.placeholder}
                aria-hidden="true"
              />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
