"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./AddToCartModal.module.css";

import { useUIStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";

import type { ProductDetail, ProductVariant } from "@/types/product";
import { getProduct } from "@/lib/api/products";

/* ==================================================
   HELPER: Fire AddToCart Meta Pixel safely
   ✅ Deduplicated per product + variant
   ✅ Logs for debugging
   ✅ Safe in SSR / Next.js
================================================== */
const fireAddToCartPixel = ({
  productId,
  variantId,
  value,
  currency = "BDT",
  contentName,
}: {
  productId: number;
  variantId?: number | null;
  value: number;
  currency?: string;
  contentName?: string;
}) => {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (!fbq) {
    console.warn("[Meta Pixel] fbq not found");
    return;
  }

  const key = `addToCartFired-${productId}-${variantId ?? 0}`;

  if (sessionStorage.getItem(key)) {
    console.log(`[Meta Pixel] AddToCart already fired for ${productId}-${variantId}`);
    return;
  }

  try {
    fbq("track", "AddToCart", {
      content_ids: [productId],
      content_type: "product",
      value,
      currency,
      content_name: contentName,
    });

    sessionStorage.setItem(key, "true");
    console.log(`[Meta Pixel] AddToCart fired for product ${productId}, variant ${variantId}`);
  } catch (err) {
    console.error("[Meta Pixel] AddToCart error:", err);
  }
};

/* ==================================================
   AddToCartModal Component
================================================== */
export default function AddToCartModal() {
  const { addToCartProductSlug, closeAddToCartModal, openCart } = useUIStore();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  /* -----------------------------
     FETCH PRODUCT
  ------------------------------ */
  useEffect(() => {
    if (!addToCartProductSlug) {
      setProduct(null);
      setSelectedVariantId(null);
      return;
    }

    setLoading(true);
    getProduct(addToCartProductSlug)
      .then((data) => {
        if (!data) return;
        setProduct(data);

        // Auto-select first in-stock variant
        const firstInStock = data.variants.find((v) => v.stock > 0);
        setSelectedVariantId(firstInStock?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [addToCartProductSlug]);

  /* -----------------------------
     DERIVED: Selected Variant
  ------------------------------ */
  const selectedVariant = useMemo(() => {
    if (!product || !selectedVariantId) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  /* -----------------------------
     HANDLER: Add To Cart
  ------------------------------ */
  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant) return;

    // 1️⃣ Add item to cart store
    addItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      image: product.images[0] ?? "/placeholder.png",
      price: Number(product.price),
      quantity: 1,
      variant_label: selectedVariant.size,
    });

    // 2️⃣ Fire AddToCart Meta Pixel
    fireAddToCartPixel({
      productId: product.id,
      variantId: selectedVariant.id,
      value: Number(product.price),
      contentName: product.name,
      currency: "BDT",
    });

    // 3️⃣ Close modal and open cart
    closeAddToCartModal();
    openCart();
  }, [product, selectedVariant, addItem, closeAddToCartModal, openCart]);

  /* -----------------------------
     RENDER / VISIBILITY
  ------------------------------ */
  if (!addToCartProductSlug) return null;

  return (
    <div className={styles.backdrop} onClick={closeAddToCartModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <h3>Select Options</h3>
          <button onClick={closeAddToCartModal} aria-label="Close">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {loading && <div className={styles.loading}>Loading…</div>}

          {product && (
            <>
              <img
                src={product.images[0] ?? "/placeholder.png"}
                alt={product.name}
                className={styles.image}
              />
              <h4 className={styles.name}>{product.name}</h4>

              <button type="button" className={styles.sizeGuide}>
                Size Guide
              </button>

              <div className={styles.sectionTitle}>Choose Size</div>
              <div className={styles.sizeGrid}>
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={variant.stock === 0}
                    className={`${styles.sizeBtn} ${
                      selectedVariantId === variant.id ? styles.active : ""
                    }`}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button
            className={styles.addBtn}
            disabled={!selectedVariant}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
