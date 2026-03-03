"use client";

import { useState, useMemo, useCallback } from "react";
import ProductVariants from "./ProductVariants";
import AddToCart from "./AddToCart";
import type { ProductDetail, ProductVariant } from "@/types/product";
import styles from "./ProductPurchase.module.css";

type Props = {
  product: ProductDetail;
  productSlug: string;

  // Optional controlled props (for wrapper usage)
  selectedVariant?: ProductVariant | null;
  onVariantChange?: (variant: ProductVariant | null) => void;

  onAddToCartClick?: () => void;
  isAddToCartDisabled?: boolean;
  disabledReason?: string;
};

export default function ProductPurchase({
  product,
  productSlug,
  selectedVariant: controlledVariant,
  onVariantChange,
  onAddToCartClick,
  isAddToCartDisabled: controlledDisabled,
  disabledReason: controlledReason,
}: Props) {
  // Internal state for variant selection if not controlled
  const [internalVariant, setInternalVariant] = useState<ProductVariant | null>(null);

  const selectedVariant = controlledVariant ?? internalVariant;

  const handleVariantChange = onVariantChange ?? ((v: ProductVariant | null) => setInternalVariant(v));

  // Derived states
  const isOutOfStock = useMemo(() => {
    if (!selectedVariant) return false;
    return (selectedVariant.stock ?? 0) <= 0;
  }, [selectedVariant]);

  const isAddToCartDisabled = useMemo(() => {
    return controlledDisabled ?? (!selectedVariant || isOutOfStock);
  }, [controlledDisabled, selectedVariant, isOutOfStock]);

  const disabledReason = useMemo(() => {
    return (
      controlledReason ??
      (!selectedVariant
        ? "Please select size and color"
        : isOutOfStock
        ? "This variant is out of stock"
        : undefined)
    );
  }, [controlledReason, selectedVariant, isOutOfStock]);

  // AddToCart click handler
  const handleClick = useCallback(() => {
    onAddToCartClick?.();
  }, [onAddToCartClick]);

  return (
    <section className={styles.wrapper}>
      {/* Variant selection */}
      <ProductVariants
        variants={product.variants}
        value={selectedVariant}
        onChange={handleVariantChange}
      />

      {/* Add to Cart button */}
      <div className={styles.cartBox}>
        <AddToCart
          product={product}
          productSlug={productSlug}
          variant={selectedVariant}
          disabled={isAddToCartDisabled}
          disabledReason={disabledReason}
          onClick={handleClick}
        />
      </div>
    </section>
  );
}