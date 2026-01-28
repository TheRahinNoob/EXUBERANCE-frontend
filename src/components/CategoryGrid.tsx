import Link from "next/link";
import styles from "./CategoryGrid.module.css";

/* ==================================================
   TYPES
================================================== */
export type CategoryCard = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
};

/* ==================================================
   PROPS
================================================== */
type CategoryGridProps = {
  categories: CategoryCard[];
};

/* ==================================================
   COMPONENT (PURE UI ONLY)
================================================== */
export default function CategoryGrid({
  categories,
}: CategoryGridProps) {
  const visibleCategories = categories.filter(
    (category) => Boolean(category.image)
  );

  if (visibleCategories.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No categories available.</p>
      </div>
    );
  }

  return (
    <section className={styles.grid}>
      {visibleCategories.map((category) => (
        <Link
          key={category.id}
          href={`/shop?categories=${category.slug}`}
          className={styles.card}
        >
          <div className={styles.imageWrapper}>
            <img
              src={category.image as string}
              alt={category.name}
              loading="lazy"
              className={styles.image}
            />
          </div>

          <h3 className={styles.title}>
            {category.name}
          </h3>
        </Link>
      ))}
    </section>
  );
}
