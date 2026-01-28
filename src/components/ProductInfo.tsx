import styles from "./ProductInfo.module.css";
import type { ProductDetail } from "@/types/product";


/* ==================================================
   ProductInfo (MOBILE-FIRST)
   Responsibility:
   - Product name
   - Price (old + current)

   ❌ NO short description
   ❌ NO full description
================================================== */
export default function ProductInfo({
  product,
}: {
  product: ProductDetail;
}) {
  const hasDiscount =
    typeof product.old_price === "number" &&
    product.old_price > product.price;

  return (
    <section className={styles.wrapper}>
      {/* =========================
         PRODUCT NAME
      ========================= */}
      <h1 className={styles.name}>
        {product.name}
      </h1>

      {/* =========================
         PRICE
      ========================= */}
      <div className={styles.priceRow}>
        {hasDiscount && (
          <span className={styles.oldPrice}>
            ৳{product.old_price}
          </span>
        )}

        <span className={styles.price}>
          <span className={styles.currency}>৳</span>
          {product.price}
        </span>
      </div>
    </section>
  );
}
