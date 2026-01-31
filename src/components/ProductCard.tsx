"use client";

import Link from "next/link";
import styles from "./ProductCard.module.css";
import { useUIStore } from "@/store/uiStore";

/* ==================================================
   TYPES
================================================== */
type ProductCardProps = {
  slug: string;
  name: string;
  price: number | string;
  old_price?: number | string | null;
  image?: string | null;
};

/* ==================================================
   HELPERS
================================================== */
function toNumber(val: number | string): number {
  return typeof val === "string" ? Number(val) : val;
}

function formatPrice(value: number | string): string {
  return toNumber(value).toFixed(0);
}

/* ==================================================
   COMPONENT
================================================== */
export default function ProductCard({
  slug,
  name,
  price,
  old_price,
  image,
}: ProductCardProps) {
  const openAddToCartModal = useUIStore(
    (state) => state.openAddToCartModal
  );

  /* -----------------------------
     DERIVED VALUES
  ------------------------------ */
  const imageSrc =
    image && image.length > 0 ? image : "/placeholder.png";

  const numericPrice = toNumber(price);

  const numericOld =
    old_price !== null &&
    old_price !== undefined &&
    old_price !== ""
      ? toNumber(old_price)
      : null;

  const hasDiscount =
    numericOld !== null && numericOld > numericPrice;

  const saveAmount = hasDiscount
    ? numericOld - numericPrice
    : 0;

  /* -----------------------------
     HANDLERS
  ------------------------------ */
  function handleAddToCart() {
    openAddToCartModal(slug);
  }

  /* -----------------------------
     RENDER
  ------------------------------ */
  return (
    <div className={styles.card}>
      {/* CLICKABLE AREA → PRODUCT PAGE */}
      <Link
        href={`/products/${slug}`}
        className={styles.cardLink}
        aria-label={`View ${name}`}
      >
        <div className={styles.imageWrap}>
          <img
            src={imageSrc}
            alt={name}
            loading="lazy"
            className={styles.image}
          />

          {hasDiscount && (
            <span className={styles.saleBadge}>
              SALE
            </span>
          )}
        </div>

        <div className={styles.content}>
          <h3 className={styles.name}>{name}</h3>

          {hasDiscount ? (
            <div className={styles.saveTag}>
              Save Tk. {formatPrice(saveAmount)}
            </div>
          ) : (
            <div className={styles.saveTagPlaceholder} />
          )}

          <div className={styles.priceRow}>
            {hasDiscount && (
              <span className={styles.oldPrice}>
                ৳{formatPrice(numericOld!)}
              </span>
            )}
            <span className={styles.price}>
              ৳{formatPrice(numericPrice)}
            </span>
          </div>
        </div>
      </Link>

      {/* REAL ACTION (OUTSIDE LINK) */}
      <button
        type="button"
        className={styles.buyNow}
        onClick={handleAddToCart}
        aria-label={`Add ${name} to cart`}
      >
        <i className="fa fa-shopping-cart" />
        &nbsp; Buy Now
      </button>
    </div>
  );
}
