import Link from "next/link";
import styles from "./FeaturedCategories.module.css";

export type FeaturedCategory = {
  name: string;
  slug: string;
  image: string;
};

export default function FeaturedCategories({
  items,
}: {
  items: FeaturedCategory[];
}) {
  if (!items.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>FEATURED</h2>

      <div className={styles.grid}>
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/category/${item.slug}`}
            className={styles.card}
          >
            <img src={item.image} alt={item.name} />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
