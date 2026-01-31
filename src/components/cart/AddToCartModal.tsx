"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AddToCartModal.module.css";

import { useUIStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";

import type { ProductDetail } from "@/types/product";
import { getProduct } from "@/lib/api/products";

/* ==================================================
   ADD TO CART MODAL (SHOP)
   - UI-driven
   - Variant-first
   - Reference-aligned
================================================== */
export default function AddToCartModal() {
  const {
    addToCartProductSlug,
    closeAddToCartModal,
    openCart,
  } = useUIStore();

  const addItem = useCartStore((s) => s.addItem);

  /* -----------------------------
     STATE
  ------------------------------ */
  const [product, setProduct] =
    useState<ProductDetail | null>(null);

  const [loading, setLoading] = useState(false);

  const [selectedVariantId, setSelectedVariantId] =
    useState<number | null>(null);

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
        const firstInStock = data.variants.find(
          (v) => v.stock > 0
        );

        setSelectedVariantId(
          firstInStock?.id ?? null
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [addToCartProductSlug]);

  /* -----------------------------
     DERIVED
  ------------------------------ */
  const selectedVariant = useMemo(() => {
    if (!product || !selectedVariantId) return null;
    return product.variants.find(
      (v) => v.id === selectedVariantId
    );
  }, [product, selectedVariantId]);

  /* -----------------------------
     ACTIONS
  ------------------------------ */
  function handleAddToCart() {
    if (!product || !selectedVariant) return;

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

    closeAddToCartModal();
    openCart();
  }

  /* -----------------------------
     VISIBILITY
  ------------------------------ */
  if (!addToCartProductSlug) return null;

  /* -----------------------------
     RENDER
  ------------------------------ */
  return (
    <div
      className={styles.backdrop}
      onClick={closeAddToCartModal}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className={styles.header}>
          <h3>Select Options</h3>
          <button
            onClick={closeAddToCartModal}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className={styles.body}>
          {loading && (
            <div className={styles.loading}>
              Loading…
            </div>
          )}

          {product && (
            <>
              {/* PRODUCT IMAGE */}
              <img
                src={
                  product.images[0] ??
                  "/placeholder.png"
                }
                alt={product.name}
                className={styles.image}
              />

              {/* NAME */}
              <h4 className={styles.name}>
                {product.name}
              </h4>

              {/* SIZE GUIDE */}
              <button
                type="button"
                className={styles.sizeGuide}
              >
                Size Guide
              </button>

              {/* VARIANTS */}
              <div className={styles.sectionTitle}>
                Choose Size
              </div>

              <div className={styles.sizeGrid}>
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={variant.stock === 0}
                    className={`${styles.sizeBtn} ${
                      selectedVariantId ===
                      variant.id
                        ? styles.active
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedVariantId(
                        variant.id
                      )
                    }
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ================= FOOTER ================= */}
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
