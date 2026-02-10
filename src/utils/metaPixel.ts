// frontend/src/utils/metaPixel.ts
"use client";

export type AddToCartPixelProps = {
  productId: number;
  variantId?: number | null;
  value: number;
  contentName?: string;
  currency?: string;
};

/**
 * Fire AddToCart event to Meta Pixel
 * Deduplicated per session per product+variant
 */
export const fireAddToCartPixel = ({
  productId,
  variantId,
  value,
  contentName,
  currency = "BDT",
}: AddToCartPixelProps) => {
  if (typeof window === "undefined") return;

  const fbq = (window as any).fbq;
  if (!fbq) return;

  const key = `addToCartFired-${productId}-${variantId ?? 0}`;

  // Prevent duplicate pixel firing in same session
  if (sessionStorage.getItem(key)) return;

  try {
    fbq("track", "AddToCart", {
      content_ids: [productId],
      content_type: "product",
      value,
      currency,
      content_name: contentName,
    });

    sessionStorage.setItem(key, "true");
    console.log(`[Meta Pixel] AddToCart fired for product ${productId}`);
  } catch (err) {
    console.error("[Meta Pixel] AddToCart error:", err);
  }
};

/**
 * Reset all AddToCart deduplication keys
 * Call this when cart is cleared
 */
export const resetAddToCartPixelKeys = () => {
  Object.keys(sessionStorage)
    .filter((k) => k.startsWith("addToCartFired-"))
    .forEach((k) => sessionStorage.removeItem(k));
};
