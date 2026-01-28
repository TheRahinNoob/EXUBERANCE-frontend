"use client";

import { useState, useCallback, useMemo } from "react";
import ProductVariants from "./ProductVariants";
import AddToCart from "./AddToCart";
import type { ProductDetail, ProductVariant } from "@/types/product";
import styles from "./ProductPurchase.module.css";

/* ==================================================
   ProductPurchase (MOBILE-FIRST CONTROLLER)
================================================== */
type Props = {
  product: ProductDetail;
  productSlug: string; // ✅ NEW (required for cart linking)
};

export default function ProductPurchase({
  product,
  productSlug,
}: Props) {
  /* -----------------------------
     Selected Variant State
  ------------------------------ */
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);

  /* -----------------------------
     Derived Business Rules
  ------------------------------ */
  const isOutOfStock = useMemo(() => {
    return selectedVariant
      ? selectedVariant.stock <= 0
      : false;
  }, [selectedVariant]);

  const isAddToCartDisabled = useMemo(() => {
    return !selectedVariant || isOutOfStock;
  }, [selectedVariant, isOutOfStock]);

  const disabledReason = useMemo(() => {
    if (!selectedVariant) {
      return "Please select size and color";
    }

    if (isOutOfStock) {
      return "This variant is out of stock";
    }

    return undefined;
  }, [selectedVariant, isOutOfStock]);

  /* -----------------------------
     Handlers
  ------------------------------ */
  const handleVariantChange = useCallback(
    (variant: ProductVariant | null) => {
      setSelectedVariant(variant);
    },
    []
  );

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <section className={styles.wrapper}>
      {/* =========================
         SIZE & COLOR SELECTION
         (MOBILE-FIRST ORDER)
      ========================= */}
      <ProductVariants
        variants={product.variants}
        value={selectedVariant}
        onChange={handleVariantChange}
      />

      {/* =========================
         ADD TO CART
      ========================= */}
      <div className={styles.cartBox}>
        <AddToCart
          product={product}
          productSlug={productSlug} // ✅ PASS SLUG DOWN
          variant={selectedVariant}
          disabled={isAddToCartDisabled}
          disabledReason={disabledReason}
        />
      </div>
    </section>
  );
}
