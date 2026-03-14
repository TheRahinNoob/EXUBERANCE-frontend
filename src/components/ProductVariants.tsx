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
   Component
================================================== */
export default function ProductVariants({ variants, value, onChange }: Props) {
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants]
  );

  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants]
  );

  const [size, setSize] = useState<string | null>(value?.size ?? null);
  const [color, setColor] = useState<string | null>(value?.color ?? null);

  const selectedVariant = useMemo(() => {
    if (!size || !color) return null;
    return variants.find((v) => v.size === size && v.color === color) ?? null;
  }, [size, color, variants]);

  useEffect(() => {
    onChange(selectedVariant);
  }, [selectedVariant, onChange]);

  useEffect(() => {
    setSize(value?.size ?? null);
    setColor(value?.color ?? null);
  }, [value?.size, value?.color]);

  const isSizeDisabled = (s: string) =>
    !variants.some((v) => v.size === s && (v.stock ?? 0) > 0);

  const isColorDisabled = (c: string) => {
    if (!size) return false;
    return !variants.some(
      (v) => v.size === size && v.color === c && (v.stock ?? 0) > 0
    );
  };

  const getColorHex = (c: string): string | undefined => {
    if (size) {
      const match = variants.find((v) => v.size === size && v.color === c);
      const hx = normalizeHex(match?.color_hex);
      if (hx) return hx;
    }
    const any = variants.find((v) => v.color === c);
    return normalizeHex(any?.color_hex);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.block}>
        <div className={styles.headRow}>
          <p className={styles.label}>Size</p>
          {size ? <span className={styles.selectedText}>{size}</span> : null}
        </div>

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
                className={`${styles.option} ${size === s ? styles.active : ""} ${
                  disabled ? styles.disabled : ""
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.headRow}>
          <p className={styles.label}>Color</p>
          {color ? <span className={styles.selectedText}>{color}</span> : null}
        </div>

        <div className={styles.options}>
          {colors.map((c) => {
            const disabled = isColorDisabled(c);
            const hex = getColorHex(c);
            const swatchBg = hex ?? "#E5E7EB";
            const swatchBorder =
              (hex ?? "").toUpperCase() === "#FFFFFF"
                ? "1px solid rgba(0,0,0,0.18)"
                : "1px solid rgba(0,0,0,0.08)";

            return (
              <button
                key={c}
                type="button"
                disabled={disabled}
                onClick={() => setColor(c)}
                className={`${styles.option} ${color === c ? styles.active : ""} ${
                  disabled ? styles.disabled : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className={styles.swatch}
                  style={{
                    backgroundColor: swatchBg,
                    border: swatchBorder,
                  }}
                />
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {size && color && selectedVariant && (
        <p
          className={`${styles.stock} ${
            (selectedVariant.stock ?? 0) <= 0
              ? styles.out
              : (selectedVariant.stock ?? 0) <= 5
              ? styles.low
              : styles.in
          }`}
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