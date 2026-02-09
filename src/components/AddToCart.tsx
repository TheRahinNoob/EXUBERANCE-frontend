"use client";

import { useState, useMemo } from "react";
import { useCartStore } from "@/store/cartStore";
import type { ProductDetail, ProductVariant } from "@/types/product";
import styles from "./AddToCart.module.css";

/* ==================================================
   PROPS
================================================== */
type Props = {
  product: ProductDetail;
  productSlug: string;
  variant: ProductVariant | null;
  disabled?: boolean;
  disabledReason?: string;
  onClick?: () => void; // callback for parent (analytics handled outside)
};

/* ==================================================
   COMPONENT
================================================== */
export default function AddToCart({
  product,
  productSlug,
  variant,
  disabled = false,
  disabledReason,
  onClick,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  /* ==================================================
     DERIVED STATE
  ================================================== */
  const maxQty = variant?.stock ?? 1;
  const isDisabled = disabled || !variant || variant.stock <= 0;

  // Ensure product price is always a valid number
  const normalizedPrice = useMemo<number>(() => {
    const price =
      typeof product.price === "string"
        ? Number(product.price)
        : product.price;

    return Number.isFinite(price) ? price : 0;
  }, [product.price]);

  /* ==================================================
     ACTIONS
  ================================================== */
  const increase = () => {
    if (!variant) return;
    setQty((q) => Math.min(q + 1, maxQty));
  };

  const decrease = () => {
    setQty((q) => Math.max(1, q - 1));
  };

  const handleAdd = () => {
    if (!variant || isDisabled) return;

    // 1️⃣ Add item to cart (ONLY responsibility of this component)
    addItem({
      product_id: product.id,
      product_slug: productSlug,
      variant_id: variant.id,
      product_name: product.name,
      variant_label: `${variant.size} / ${variant.color}`,
      image: product.main_image,
      price: normalizedPrice,
      quantity: qty,
    });

    // 2️⃣ Reset quantity
    setQty(1);

    // 3️⃣ Notify parent (Meta Pixel handled in wrapper)
    onClick?.();
  };

  /* ==================================================
     RENDER
  ================================================== */
  return (
    <div className={styles.wrapper}>
      {/* MAIN ROW */}
      <div className={styles.row}>
        {/* QUANTITY CONTROLS */}
        <div className={styles.qtyBox}>
          <button
            type="button"
            onClick={decrease}
            disabled={isDisabled || qty <= 1}
            className={styles.qtyBtn}
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span className={styles.qtyValue}>{qty}</span>

          <button
            type="button"
            onClick={increase}
            disabled={isDisabled || qty >= maxQty}
            className={styles.qtyBtn}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* ADD TO CART BUTTON */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isDisabled}
          className={styles.addBtn}
        >
          + Add To Cart
        </button>
      </div>

      {/* HELPER TEXT */}
      {isDisabled && (
        <p className={styles.helper}>
          {disabledReason ?? "Please select size and color"}
        </p>
      )}
    </div>
  );
}
