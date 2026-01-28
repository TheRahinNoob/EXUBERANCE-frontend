import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

/* ==================================================
   TYPES — STRICT & ENFORCED
================================================== */
export type ProductGridItem = {
  id: number;
  slug: string;
  name: string;

  price: string | number;
  old_price: string | number | null; // 🔥 ENFORCED

  main_image: string | null;
};

type ProductGridProps = {
  products: ProductGridItem[];
  emptyMessage?: string;
};

/* ==================================================
   PRODUCT GRID — AUTHORITATIVE PIPELINE
================================================== */
export default function ProductGrid({
  products,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section className={styles.grid}>
      {products.map((product) => {
        /* 🔍 HARD DEBUG (SAFE TO KEEP) */
        if (
          product.old_price === undefined &&
          process.env.NODE_ENV !== "production"
        ) {
          console.warn(
            "⚠️ old_price missing for product:",
            product.slug,
            product
          );
        }

        return (
          <ProductCard
            key={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            old_price={product.old_price ?? null} // 🔥 FORCE
            image={product.main_image ?? ""}
          />
        );
      })}
    </section>
  );
}
