"use client";

import styles from "./ProductInfo.module.css";
import type { ProductDetail } from "@/types/product";

/* ==================================================
   HELPERS
================================================== */
function normalizePrice(
  value: string | number | null | undefined
): number | null {
  if (value === null || value === undefined) return null;

  const num =
    typeof value === "number"
      ? value
      : Number.parseFloat(value);

  return Number.isFinite(num) ? num : null;
}

/* ==================================================
   ProductInfo
================================================== */
export default function ProductInfo({
  product,
}: {
  product: ProductDetail;
}) {
  const price = normalizePrice(product.price);
  const oldPrice = normalizePrice(product.old_price);

  const hasDiscount =
    price !== null &&
    oldPrice !== null &&
    oldPrice > price;

  const discountPercent =
    hasDiscount && price !== null && oldPrice !== null
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  return (
    <section className={styles.wrapper}>
      {discountPercent ? (
        <div className={styles.badges}>
          <span className={styles.badge}>Save {discountPercent}%</span>
        </div>
      ) : null}

      <h1 className={styles.name}>{product.name}</h1>

      <div className={styles.priceRow}>
        {price !== null && (
          <span className={styles.price}>
            <span className={styles.currency}>৳</span>
            {price}
          </span>
        )}

        {hasDiscount && (
          <span className={styles.oldPrice}>
            ৳{oldPrice}
          </span>
        )}
      </div>
    </section>
  );
}