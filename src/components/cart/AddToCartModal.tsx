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
   HELPERS
================================================== */
type ColorOption = {
  color: string;
  colorHex?: string;
  inStock: boolean;
};

function normalizeToken(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function getColorKey(variant: Pick<ProductVariant, "color">) {
  return normalizeToken(variant.color);
}

function getSizeKey(variant: Pick<ProductVariant, "size">) {
  return normalizeToken(variant.size);
}

function hasValidHex(hex?: string) {
  const value = String(hex ?? "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

/* ==================================================
   AddToCartModal Component
================================================== */
export default function AddToCartModal() {
  const { addToCartProductSlug, closeAddToCartModal, openCart } = useUIStore();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  /* -----------------------------
     FETCH PRODUCT
  ------------------------------ */
  useEffect(() => {
    if (!addToCartProductSlug) {
      setProduct(null);
      setSelectedColor("");
      setSelectedSize("");
      return;
    }

    setLoading(true);

    getProduct(addToCartProductSlug)
      .then((data) => {
        if (!data) {
          setProduct(null);
          setSelectedColor("");
          setSelectedSize("");
          return;
        }

        setProduct(data);

        const firstInStockVariant = data.variants.find((v) => v.stock > 0);

        if (firstInStockVariant) {
          setSelectedColor(firstInStockVariant.color);
          setSelectedSize(firstInStockVariant.size);
          return;
        }

        const firstVariant = data.variants[0];
        setSelectedColor(firstVariant?.color ?? "");
        setSelectedSize(firstVariant?.size ?? "");
      })
      .finally(() => setLoading(false));
  }, [addToCartProductSlug]);

  /* -----------------------------
     DERIVED: COLOR OPTIONS
  ------------------------------ */
  const colorOptions = useMemo<ColorOption[]>(() => {
    if (!product) return [];

    const map = new Map<string, ColorOption>();

    for (const variant of product.variants) {
      const key = getColorKey(variant);
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          color: variant.color,
          colorHex: hasValidHex(variant.color_hex) ? variant.color_hex : undefined,
          inStock: variant.stock > 0,
        });
        continue;
      }

      if (!existing.colorHex && hasValidHex(variant.color_hex)) {
        existing.colorHex = variant.color_hex;
      }

      if (variant.stock > 0) {
        existing.inStock = true;
      }
    }

    return Array.from(map.values());
  }, [product]);

  /* -----------------------------
     DERIVED: VARIANTS FOR SELECTED COLOR
  ------------------------------ */
  const variantsForSelectedColor = useMemo(() => {
    if (!product || !selectedColor) return [];

    const selectedColorKey = normalizeToken(selectedColor);

    return product.variants.filter(
      (variant) => getColorKey(variant) === selectedColorKey
    );
  }, [product, selectedColor]);

  /* -----------------------------
     DERIVED: UNIQUE SIZE OPTIONS
  ------------------------------ */
  const sizeOptions = useMemo(() => {
    const map = new Map<
      string,
      {
        size: string;
        inStock: boolean;
      }
    >();

    for (const variant of variantsForSelectedColor) {
      const key = getSizeKey(variant);
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          size: variant.size,
          inStock: variant.stock > 0,
        });
        continue;
      }

      if (variant.stock > 0) {
        existing.inStock = true;
      }
    }

    return Array.from(map.values());
  }, [variantsForSelectedColor]);

  /* -----------------------------
     KEEP SELECTED COLOR VALID
  ------------------------------ */
  useEffect(() => {
    if (!product) return;

    if (!colorOptions.length) {
      if (selectedColor !== "") setSelectedColor("");
      return;
    }

    const selectedExists = colorOptions.some(
      (option) => normalizeToken(option.color) === normalizeToken(selectedColor)
    );

    if (selectedExists) return;

    const firstInStockColor = colorOptions.find((option) => option.inStock);
    const fallbackColor = firstInStockColor?.color ?? colorOptions[0]?.color ?? "";

    if (fallbackColor !== selectedColor) {
      setSelectedColor(fallbackColor);
    }
  }, [product, colorOptions, selectedColor]);

  /* -----------------------------
     KEEP SELECTED SIZE VALID FOR SELECTED COLOR
  ------------------------------ */
  useEffect(() => {
    if (!product) return;

    if (!sizeOptions.length) {
      if (selectedSize !== "") setSelectedSize("");
      return;
    }

    const selectedExists = sizeOptions.some(
      (option) => normalizeToken(option.size) === normalizeToken(selectedSize)
    );

    if (selectedExists) return;

    const firstInStockSize = sizeOptions.find((option) => option.inStock);
    const fallbackSize = firstInStockSize?.size ?? sizeOptions[0]?.size ?? "";

    if (fallbackSize !== selectedSize) {
      setSelectedSize(fallbackSize);
    }
  }, [product, sizeOptions, selectedSize]);

  /* -----------------------------
     DERIVED: Selected Variant
  ------------------------------ */
  const selectedVariant = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null;

    const selectedColorKey = normalizeToken(selectedColor);
    const selectedSizeKey = normalizeToken(selectedSize);

    return (
      product.variants.find(
        (variant) =>
          getColorKey(variant) === selectedColorKey &&
          getSizeKey(variant) === selectedSizeKey
      ) || null
    );
  }, [product, selectedColor, selectedSize]);

  /* -----------------------------
     HANDLER: CHANGE COLOR
  ------------------------------ */
  const handleSelectColor = useCallback(
    (color: string) => {
      setSelectedColor(color);

      const matchingVariants = (product?.variants ?? []).filter(
        (variant) => getColorKey(variant) === normalizeToken(color)
      );

      const uniqueSizes = new Map<
        string,
        {
          size: string;
          inStock: boolean;
        }
      >();

      for (const variant of matchingVariants) {
        const key = getSizeKey(variant);
        const existing = uniqueSizes.get(key);

        if (!existing) {
          uniqueSizes.set(key, {
            size: variant.size,
            inStock: variant.stock > 0,
          });
          continue;
        }

        if (variant.stock > 0) {
          existing.inStock = true;
        }
      }

      const sizeList = Array.from(uniqueSizes.values());

      const existingSizeStillValid = sizeList.some(
        (item) => normalizeToken(item.size) === normalizeToken(selectedSize)
      );

      if (existingSizeStillValid) return;

      const firstInStockSize = sizeList.find((item) => item.inStock);
      setSelectedSize(firstInStockSize?.size ?? sizeList[0]?.size ?? "");
    },
    [product, selectedSize]
  );

  /* -----------------------------
     HANDLER: Add To Cart
  ------------------------------ */
  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant || selectedVariant.stock <= 0) return;

    addItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      image: product.images[0] ?? "/placeholder.png",
      price: Number(product.price),
      quantity: 1,
      variant_label: `${selectedVariant.color} / ${selectedVariant.size}`,
    });

    fireAddToCartPixel({
      productId: product.id,
      variantId: selectedVariant.id,
      value: Number(product.price),
      contentName: product.name,
      currency: "BDT",
    });

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
        <div className={styles.header}>
          <h3>Select Options</h3>
          <button onClick={closeAddToCartModal} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {loading && <div className={styles.loading}>Loading…</div>}

          {!loading && product && (
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

              {colorOptions.length > 0 && (
                <>
                  <div className={styles.sectionTitle}>Choose Color</div>

                  <div className={styles.colorGrid}>
                    {colorOptions.map((option) => {
                      const isActive =
                        normalizeToken(option.color) === normalizeToken(selectedColor);

                      return (
                        <button
                          key={option.color}
                          type="button"
                          disabled={!option.inStock}
                          className={`${styles.colorBtn} ${
                            isActive ? styles.activeColor : ""
                          }`}
                          onClick={() => handleSelectColor(option.color)}
                          aria-label={`Select color ${option.color}`}
                          title={option.color}
                        >
                          {option.colorHex ? (
                            <span
                              className={styles.colorSwatch}
                              style={{ backgroundColor: option.colorHex }}
                              aria-hidden="true"
                            />
                          ) : (
                            <span className={styles.colorSwatchFallback} aria-hidden="true">
                              ?
                            </span>
                          )}

                          <span className={styles.colorText}>{option.color}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className={styles.sectionTitle}>Choose Size</div>

              <div className={styles.sizeGrid}>
                {sizeOptions.map((option) => (
                  <button
                    key={option.size}
                    type="button"
                    disabled={!option.inStock}
                    className={`${styles.sizeBtn} ${
                      normalizeToken(selectedSize) === normalizeToken(option.size)
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => setSelectedSize(option.size)}
                  >
                    {option.size}
                  </button>
                ))}
              </div>

              {!loading && product && !product.variants.length && (
                <div className={styles.emptyState}>No variants available.</div>
              )}

              {!!product.variants.length && !selectedVariant && (
                <div className={styles.helperText}>
                  Please select a valid color and size.
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.addBtn}
            disabled={!selectedVariant || selectedVariant.stock <= 0}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}