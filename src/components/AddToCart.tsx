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
  onClick?: () => void;
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
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxQty = variant?.stock ?? 1;
  const isDisabled = disabled || !variant || variant.stock <= 0;

  const normalizedPrice = useMemo<number>(() => {
    const price =
      typeof product.price === "string"
        ? Number(product.price)
        : product.price;

    return Number.isFinite(price) ? price : 0;
  }, [product.price]);

  const increase = () => {
    if (!variant) return;
    setQty((q) => Math.min(q + 1, maxQty));
  };

  const decrease = () => {
    setQty((q) => Math.max(1, q - 1));
  };

  const handleAdd = () => {
    if (!variant || isDisabled) return;

    setLoading(true);

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

    setQty(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
    setLoading(false);

    onClick?.();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
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

        <button
          type="button"
          onClick={handleAdd}
          disabled={isDisabled || loading}
          className={styles.addBtn}
        >
          {loading ? "Adding..." : added ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>

      {isDisabled && (
        <p className={styles.helper}>
          {disabledReason ?? "Please select size and color"}
        </p>
      )}

      {added && (
        <div className={styles.toast}>
          <span className={styles.toastIcon}>✓</span>
          <span>Added to cart</span>
        </div>
      )}
    </div>
  );
}