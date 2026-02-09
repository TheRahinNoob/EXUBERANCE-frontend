"use client";

import { useState, useCallback, useMemo } from "react";
import ProductPurchase from "./ProductPurchase";
import type { ProductDetail, ProductVariant } from "@/types/product";

/* ==================================================
   HELPER: Meta Pixel tracking for AddToCart
   ✅ Deduplicated by productId + click
================================================== */
const trackAddToCart = ({
  productId,
  value,
  currency = "BDT",
  contentName,
}: {
  productId: number;
  value: number;
  currency?: string;
  contentName?: string;
}) => {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (!fbq) return;

  const lastFired = sessionStorage.getItem(`addToCartFired-${productId}`);
  if (lastFired === "true") return;

  fbq("track", "AddToCart", {
    content_ids: [productId],
    content_type: "product",
    value,
    currency,
    content_name: contentName,
  });

  sessionStorage.setItem(`addToCartFired-${productId}`, "true");
};

/* ==================================================
   ProductPurchaseWrapper
   ✅ Wraps ProductPurchase with AddToCart tracking
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
    // Safe: treat undefined stock as 0
    if (!selectedVariant) return false;
    return (selectedVariant.stock ?? 0) <= 0;
  }, [selectedVariant]);

  const isAddToCartDisabled = useMemo(() => !selectedVariant || isOutOfStock, [selectedVariant, isOutOfStock]);

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

    const priceToTrack = Number(product.price);

    // ✅ Fire Meta Pixel safely (deduplicated per product + click)
    trackAddToCart({
      productId: product.id,
      value: priceToTrack,
      currency: "BDT",
      contentName: product.name,
    });

    // Actual cart addition logic is handled in ProductPurchase component
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
