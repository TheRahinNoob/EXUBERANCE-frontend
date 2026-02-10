"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface ViewContentPixelProps {
  productId: number;
  price: number;
  currency?: string;
}

/**
 * Meta ViewContent – fires ONCE per product page view
 * ✅ Works with Next.js App Router client-side navigation
 */
export default function ViewContentPixel({
  productId,
  price,
  currency = "BDT",
}: ViewContentPixelProps) {
  const pathname = usePathname();
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.fbq !== "function") return;

    // Prevent double firing for the same product
    if (firedRef.current.has(productId)) return;
    firedRef.current.add(productId);

    try {
      window.fbq("track", "ViewContent", {
        content_ids: [String(productId)],
        content_type: "product",
        value: price,
        currency,
      });
      console.log(`[Meta Pixel] ViewContent fired for product ${productId}`);
    } catch (err) {
      console.error("[Meta Pixel] ViewContent error:", err);
    }
  }, [pathname, productId, price, currency]);

  return null;
}

/* --------------------------------------------------
   Global typing for Meta Pixel
-------------------------------------------------- */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}
