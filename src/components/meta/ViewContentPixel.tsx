"use client";

import { useEffect } from "react";

type Props = {
  productId: number;
  price: number;
};

export default function ViewContentPixel({
  productId,
  price,
}: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!(window as any).fbq) return;

    (window as any).fbq("track", "ViewContent", {
      content_ids: [productId],
      content_type: "product",
      value: price,
      currency: "BDT",
    });
  }, [productId, price]);

  return null;
}
