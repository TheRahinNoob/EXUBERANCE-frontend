import Link from "next/link";
import styles from "./CategoryList.module.css";

/* ==================================================
   TYPES
================================================== */
export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
};

/* ==================================================
   PROPS
================================================== */
type Props = {
  categories: CategoryNode[];
};

/* ==================================================
   COMPONENT
================================================== */
export default function CategoryList({ categories }: Props) {
  if (!categories || categories.length === 0) {
    return (
      <p style={{ color: "#666" }}>
        No sub-categories available.
      </p>
    );
  }

  return (
    <section
      className={styles.grid}
      aria-label="Sub-categories"
    >
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/shop?categories=${category.slug}`}
          className={styles.card}
        >
          <span className={styles.name}>
            {category.name}
          </span>
        </Link>
      ))}
    </section>
  );
}
