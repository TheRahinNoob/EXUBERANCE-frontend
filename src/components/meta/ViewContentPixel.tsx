"use client";

import { useEffect } from "react";

interface ViewContentPixelProps {
  productId: number;
  price: number;
  currency?: string;
}

/**
 * Fires a Meta "ViewContent" event safely.
 * Deduplicates by product ID using sessionStorage to avoid multiple events.
 */
export default function ViewContentPixel({
  productId,
  price,
  currency = "BDT",
}: ViewContentPixelProps) {
  useEffect(() => {
    // TypeScript-safe check for fbq
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;

    // 🔒 Deduplicate: fire only once per product per session
    const lastFiredId = sessionStorage.getItem("lastViewContentId");
    if (lastFiredId === String(productId)) return;

    try {
      window.fbq("track", "ViewContent", {
        content_ids: [String(productId)],
        content_type: "product",
        value: price,
        currency,
      });
      sessionStorage.setItem("lastViewContentId", String(productId));
    } catch (err) {
      console.error("[Meta Pixel] ViewContent tracking error:", err);
    }
  }, [productId, price, currency]);

  return null;
}

// Extend Window type for fbq
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}
