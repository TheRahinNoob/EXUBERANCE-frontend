"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import type { ProductDetail, ProductVariant } from "@/types/product";
import styles from "./AddToCart.module.css";

/* ==================================================
   PROPS
================================================== */
type Props = {
  product: ProductDetail;
  productSlug: string; // ✅ NEW (required)
  variant: ProductVariant | null;
  disabled?: boolean;
  disabledReason?: string;
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
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const maxQty = variant?.stock ?? 1;
  const isDisabled =
    disabled || !variant || variant.stock <= 0;

  const increase = () => {
    if (!variant) return;
    setQty((q) => Math.min(q + 1, maxQty));
  };

  const decrease = () => {
    setQty((q) => Math.max(1, q - 1));
  };

  const handleAdd = () => {
    if (!variant || isDisabled) return;

    addItem({
      product_id: product.id,
      product_slug: productSlug, // ✅ FIX IS HERE
      variant_id: variant.id,
      product_name: product.name,
      variant_label: `${variant.size} / ${variant.color}`,
      image: product.main_image,
      price: product.price,
      quantity: qty,
    });

    setQty(1);
  };

  return (
    <div className={styles.wrapper}>
      {/* MAIN ROW */}
      <div className={styles.row}>
        {/* QUANTITY */}
        <div className={styles.qtyBox}>
          <button
            type="button"
            onClick={decrease}
            disabled={isDisabled || qty <= 1}
            className={styles.qtyBtn}
          >
            −
          </button>

          <span className={styles.qtyValue}>{qty}</span>

          <button
            type="button"
            onClick={increase}
            disabled={isDisabled || qty >= maxQty}
            className={styles.qtyBtn}
          >
            +
          </button>
        </div>

        {/* ADD TO CART */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isDisabled}
          className={styles.addBtn}
        >
          + Add To Cart
        </button>
      </div>

      {/* HELPER */}
      {isDisabled && (
        <p className={styles.helper}>
          {disabledReason ??
            "Please select size and color"}
        </p>
      )}
    </div>
  );
}
