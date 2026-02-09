"use client";

import { useEffect } from "react";

interface AddToCartPixelProps {
  productId: number;
  price: number;
  currency?: string;
}

/**
 * Fires a Meta "AddToCart" event safely.
 * Deduplicates by product ID using sessionStorage to avoid multiple events.
 */
export default function AddToCartPixel({
  productId,
  price,
  currency = "BDT",
}: AddToCartPixelProps) {
  useEffect(() => {
    if (!window.fbq) return;

    // 🔒 Deduplicate: fire only once per product per session
    const lastFiredIds = sessionStorage.getItem("lastAddToCartIds") || "";
    const firedSet = new Set(lastFiredIds.split(",").filter(Boolean));

    if (firedSet.has(String(productId))) return;

    window.fbq("track", "AddToCart", {
      content_ids: [String(productId)],
      content_type: "product",
      value: price,
      currency,
    });

    firedSet.add(String(productId));
    sessionStorage.setItem("lastAddToCartIds", Array.from(firedSet).join(","));
  }, [productId, price, currency]);

  return null;
}
