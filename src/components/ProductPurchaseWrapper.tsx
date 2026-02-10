"use client";

import { useState, useCallback, useMemo } from "react";
import ProductPurchase from "./ProductPurchase";
import type { ProductDetail, ProductVariant } from "@/types/product";
import { fireAddToCartPixel } from "@/utils/metaPixel";

/* ==================================================
   ProductPurchaseWrapper Component
   ✅ Wraps ProductPurchase
   ✅ Fires AddToCart Meta Pixel safely
================================================== */
type Props = {
  product: ProductDetail;
  productSlug: string;
};

export default function ProductPurchaseWrapper({ product, productSlug }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  /* -----------------------------
     Derived states
  ------------------------------ */
  const isOutOfStock = useMemo(() => {
    if (!selectedVariant) return false;
    return (selectedVariant.stock ?? 0) <= 0;
  }, [selectedVariant]);

  const isAddToCartDisabled = useMemo(
    () => !selectedVariant || isOutOfStock,
    [selectedVariant, isOutOfStock]
  );

  const disabledReason = useMemo(() => {
    if (!selectedVariant) return "Please select size and color";
    if (isOutOfStock) return "This variant is out of stock";
    return undefined;
  }, [selectedVariant, isOutOfStock]);

  /* -----------------------------
     Handlers
  ------------------------------ */
  const handleVariantChange = useCallback((variant: ProductVariant | null) => {
    setSelectedVariant(variant);
  }, []);

  const handleAddToCartClick = useCallback(() => {
    if (!selectedVariant) return;

    // Fire AddToCart Meta Pixel
    fireAddToCartPixel({
      productId: product.id,
      variantId: selectedVariant.id,
      value: Number(product.price),
      contentName: product.name,
      currency: "BDT",
    });

    // Actual cart logic is handled in ProductPurchase component
  }, [selectedVariant, product]);

  /* -----------------------------
     Render
  ------------------------------ */
  return (
    <ProductPurchase
      product={product}
      productSlug={productSlug}
      selectedVariant={selectedVariant}
      onVariantChange={handleVariantChange}
      onAddToCartClick={handleAddToCartClick}
      isAddToCartDisabled={isAddToCartDisabled}
      disabledReason={disabledReason}
    />
  );
}
