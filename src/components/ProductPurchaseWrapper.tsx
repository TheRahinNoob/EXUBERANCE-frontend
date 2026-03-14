"use client";

import { useState, useCallback, useMemo } from "react";
import ProductPurchase from "./ProductPurchase";
import type { ProductDetail, ProductVariant } from "@/types/product";
import { fireAddToCartPixel } from "@/utils/metaPixel";

/* ==================================================
   ProductPurchaseWrapper Component
================================================== */
type Props = {
  product: ProductDetail;
  productSlug: string;
};

export default function ProductPurchaseWrapper({ product, productSlug }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const isOutOfStock = useMemo(() => {
    return !selectedVariant || (selectedVariant.stock ?? 0) <= 0;
  }, [selectedVariant]);

  const isAddToCartDisabled = useMemo(() => {
    return !selectedVariant || isOutOfStock;
  }, [selectedVariant, isOutOfStock]);

  const disabledReason = useMemo(() => {
    if (!selectedVariant) return "Please select size and color";
    if (isOutOfStock) return "This variant is out of stock";
    return undefined;
  }, [selectedVariant, isOutOfStock]);

  const handleVariantChange = useCallback((variant: ProductVariant | null) => {
    setSelectedVariant(variant);
  }, []);

  const handleAddToCartClick = useCallback(() => {
    if (!selectedVariant) return;

    fireAddToCartPixel({
      productId: product.id,
      variantId: selectedVariant.id,
      value: Number(product.price),
      contentName: product.name,
      currency: "BDT",
    });
  }, [selectedVariant, product.id, product.price, product.name]);

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