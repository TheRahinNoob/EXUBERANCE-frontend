import Link from "next/link";
import styles from "./HotCategories.module.css";

/**
 * 🔥 SINGLE SOURCE OF TRUTH
 * - Never redefine domain types in components
 * - API layer owns the contract
 */
import type { HotCategory } from "@/lib/api/types";

type Props = {
  items: HotCategory[];
};

export default function HotCategories({ items }: Props) {
  // Absolute safety guard
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/category/${item.slug}`}
            className={styles.card}
            aria-label={item.name}
          >
            {/* ✅ SAFE IMAGE HANDLING (NO CRASHES) */}
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
              />
            ) : (
              <div
                className={styles.imagePlaceholder}
                aria-hidden="true"
              />
            )}

            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
