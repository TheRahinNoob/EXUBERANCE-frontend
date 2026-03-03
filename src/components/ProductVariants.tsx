"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ProductVariants.module.css";
import type { ProductVariant } from "@/types/product";

type Props = {
  variants: ProductVariant[];
  value: ProductVariant | null;
  onChange: (variant: ProductVariant | null) => void;
};

/* ==================================================
   Helpers
================================================== */
function isValidHex(hex?: string): hex is string {
  return typeof hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(hex.trim());
}

function normalizeHex(hex?: string): string | undefined {
  if (!isValidHex(hex)) return undefined;
  return hex.trim().toUpperCase();
}

/* ==================================================
   Component (MOBILE-FIRST)
================================================== */
export default function ProductVariants({ variants, value, onChange }: Props) {
  /* -----------------------------
     Unique options
  ------------------------------ */
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants]
  );

  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants]
  );

  /* -----------------------------
     Local selection state
  ------------------------------ */
  const [size, setSize] = useState<string | null>(value?.size ?? null);
  const [color, setColor] = useState<string | null>(value?.color ?? null);

  /* -----------------------------
     Resolve selected variant
  ------------------------------ */
  const selectedVariant = useMemo(() => {
    if (!size || !color) return null;
    return variants.find((v) => v.size === size && v.color === color) ?? null;
  }, [size, color, variants]);

  /* -----------------------------
     Sync to parent
  ------------------------------ */
  useEffect(() => {
    onChange(selectedVariant);
  }, [selectedVariant, onChange]);

  /* -----------------------------
     Disabled logic
  ------------------------------ */
  const isSizeDisabled = (s: string) =>
    !variants.some((v) => v.size === s && (v.stock ?? 0) > 0);

  const isColorDisabled = (c: string) => {
    if (!size) return false;
    return !variants.some(
      (v) => v.size === size && v.color === c && (v.stock ?? 0) > 0
    );
  };

  /* -----------------------------
     Color swatch resolver
     - If size selected: prefer exact size+color variant hex
     - Otherwise: use any variant’s hex for that color
  ------------------------------ */
  const getColorHex = (c: string): string | undefined => {
    if (size) {
      const match = variants.find((v) => v.size === size && v.color === c);
      const hx = normalizeHex(match?.color_hex);
      if (hx) return hx;
    }
    const any = variants.find((v) => v.color === c);
    return normalizeHex(any?.color_hex);
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
          {sizes.map((s) => {
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
         COLOR (WITH SWATCH)
      ========================= */}
      <div className={styles.block}>
        <div className={styles.options}>
          {colors.map((c) => {
            const disabled = isColorDisabled(c);
            const hex = getColorHex(c);

            // Fallback swatch when color_hex is missing/invalid
            const swatchBg = hex ?? "#E5E7EB"; // neutral gray
            const swatchBorder =
              (hex ?? "").toUpperCase() === "#FFFFFF"
                ? "1px solid rgba(0,0,0,0.25)" // white needs visible border
                : "1px solid rgba(0,0,0,0.08)";

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
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    backgroundColor: swatchBg,
                    border: swatchBorder,
                    verticalAlign: "middle",
                    flex: "0 0 auto",
                  }}
                />
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
              (selectedVariant.stock ?? 0) <= 0
                ? styles.out
                : (selectedVariant.stock ?? 0) <= 5
                ? styles.low
                : styles.in
            }
          `}
        >
          {(selectedVariant.stock ?? 0) <= 0
            ? "Out of stock"
            : (selectedVariant.stock ?? 0) <= 5
            ? `Only ${selectedVariant.stock} left`
            : "In stock"}
        </p>
      )}

      {size && color && !selectedVariant && (
        <p className={styles.unavailable}>This combination is unavailable</p>
      )}
    </div>
  );
}