"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ProductVariants.module.css";

/* ==================================================
   Types
================================================== */
export type ProductVariant = {
  id: number;
  size: string;
  color: string;
  stock: number;
};

type Props = {
  variants: ProductVariant[];
  value: ProductVariant | null;
  onChange: (variant: ProductVariant | null) => void;
};

/* ==================================================
   Component (MOBILE-FIRST)
================================================== */
export default function ProductVariants({
  variants,
  value,
  onChange,
}: Props) {
  /* -----------------------------
     Unique options
  ------------------------------ */
  const sizes = useMemo(
    () => Array.from(new Set(variants.map(v => v.size))),
    [variants]
  );

  const colors = useMemo(
    () => Array.from(new Set(variants.map(v => v.color))),
    [variants]
  );

  /* -----------------------------
     Local selection state
  ------------------------------ */
  const [size, setSize] = useState<string | null>(
    value?.size ?? null
  );
  const [color, setColor] = useState<string | null>(
    value?.color ?? null
  );

  /* -----------------------------
     Resolve selected variant
  ------------------------------ */
  const selectedVariant = useMemo(() => {
    if (!size || !color) return null;
    return (
      variants.find(
        v => v.size === size && v.color === color
      ) ?? null
    );
  }, [size, color, variants]);

  /* -----------------------------
     Sync to parent
  ------------------------------ */
  useEffect(() => {
    onChange(selectedVariant);
  }, [selectedVariant, onChange]);

  /* -----------------------------
     Helpers
  ------------------------------ */
  const isSizeDisabled = (s: string) =>
    !variants.some(v => v.size === s && v.stock > 0);

  const isColorDisabled = (c: string) => {
    if (!size) return false;
    return !variants.some(
      v => v.size === size && v.color === c && v.stock > 0
    );
  };

  /* ==================================================
     UI
  ================================================== */
  return (
    <div className={styles.wrapper}>
      {/* =========================
         SIZE (WITH LABEL)
      ========================= */}
      <div className={styles.block}>
        <p className={styles.label}>size and color</p>

        <div className={styles.options}>
          {sizes.map(s => {
            const disabled = isSizeDisabled(s);

            return (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSize(s);
                  setColor(null);
                }}
                className={`${styles.option}
                  ${size === s ? styles.active : ""}
                  ${disabled ? styles.disabled : ""}
                `}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================
         COLOR (NO LABEL)
      ========================= */}
      <div className={styles.block}>
        <div className={styles.options}>
          {colors.map(c => {
            const disabled = isColorDisabled(c);

            return (
              <button
                key={c}
                type="button"
                disabled={disabled}
                onClick={() => setColor(c)}
                className={`${styles.option}
                  ${color === c ? styles.active : ""}
                  ${disabled ? styles.disabled : ""}
                `}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================
         STOCK STATUS
      ========================= */}
      {size && color && selectedVariant && (
        <p
          className={`${styles.stock}
            ${
              selectedVariant.stock <= 0
                ? styles.out
                : selectedVariant.stock <= 5
                ? styles.low
                : styles.in
            }
          `}
        >
          {selectedVariant.stock <= 0
            ? "Out of stock"
            : selectedVariant.stock <= 5
            ? `Only ${selectedVariant.stock} left`
            : "In stock"}
        </p>
      )}

      {size && color && !selectedVariant && (
        <p className={styles.unavailable}>
          This combination is unavailable
        </p>
      )}
    </div>
  );
}
