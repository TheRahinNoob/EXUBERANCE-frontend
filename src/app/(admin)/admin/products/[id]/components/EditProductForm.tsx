"use client";

import { useEffect, useMemo, useState } from "react";
import "./edit-product-form.css";

import { useAdminToast } from "@/hooks/useAdminToast";
import { updateAdminProduct } from "@/lib/admin-api/products";

/* ==================================================
   TYPES — STRICT BACKEND CONTRACT
================================================== */

type Props = {
  productId: number;
  price: string;
  old_price: string | null;
  is_featured: boolean;

  /**
   * Called after successful update
   * Parent should sync its own state
   */
  onUpdated?: (data: {
    price: string;
    old_price: string | null;
    is_featured: boolean;
  }) => void;
};

/* ==================================================
   HELPERS
================================================== */

function normalizeNumber(value: string | null): string | null {
  if (value === null || value === "") return null;
  return String(Number(value));
}

/* ==================================================
   COMPONENT
================================================== */

export default function EditProductForm({
  productId,
  price,
  old_price,
  is_featured,
  onUpdated,
}: Props) {
  const { showToast } = useAdminToast();

  /* ==================================================
     FORM STATE
  ================================================== */

  const [formPrice, setFormPrice] = useState(price);
  const [formOldPrice, setFormOldPrice] =
    useState<string | null>(old_price);
  const [formFeatured, setFormFeatured] =
    useState(is_featured);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ==================================================
     SYNC FROM PARENT (SOURCE OF TRUTH)
  ================================================== */

  useEffect(() => {
    setFormPrice(price);
    setFormOldPrice(old_price);
    setFormFeatured(is_featured);
  }, [price, old_price, is_featured]);

  /* ==================================================
     DIRTY CHECK (NORMALIZED)
  ================================================== */

  const isDirty = useMemo(() => {
    return (
      normalizeNumber(formPrice) !==
        normalizeNumber(price) ||
      normalizeNumber(formOldPrice) !==
        normalizeNumber(old_price) ||
      formFeatured !== is_featured
    );
  }, [
    formPrice,
    formOldPrice,
    formFeatured,
    price,
    old_price,
    is_featured,
  ]);

  /* ==================================================
     SUBMIT
  ================================================== */

  const handleSubmit = async () => {
    if (saving || !isDirty) return;

    setSaving(true);
    setError(null);

    try {
      const numericPrice = Number(formPrice);
      const numericOldPrice =
        formOldPrice !== null
          ? Number(formOldPrice)
          : null;

      if (!Number.isFinite(numericPrice)) {
        throw new Error("Price must be a valid number");
      }

      if (numericPrice < 0) {
        throw new Error("Price cannot be negative");
      }

      if (
        numericOldPrice !== null &&
        !Number.isFinite(numericOldPrice)
      ) {
        throw new Error("Old price must be a valid number");
      }

      if (
        numericOldPrice !== null &&
        numericOldPrice < 0
      ) {
        throw new Error("Old price cannot be negative");
      }

      if (
        numericOldPrice !== null &&
        numericOldPrice <= numericPrice
      ) {
        throw new Error(
          "Old price must be greater than price"
        );
      }

      const updated = await updateAdminProduct(
        productId,
        {
          price: numericPrice.toString(),
          old_price:
            numericOldPrice !== null
              ? numericOldPrice.toString()
              : null,
          is_featured: formFeatured,
        }
      );

      showToast("Product updated", "success");

      onUpdated?.({
        price: updated.price,
        old_price: updated.old_price,
        is_featured: updated.is_featured,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Update failed";

      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <section className="product-edit-card">
      <h3>Edit Product</h3>

      {error && (
        <div className="product-edit-error">
          {error}
        </div>
      )}

      <div className="product-edit-form">
        {/* PRICE */}
        <div className="product-edit-field">
          <label>
            Price
            <input
              className="product-edit-input"
              type="number"
              step="0.01"
              min="0"
              value={formPrice}
              onChange={(e) =>
                setFormPrice(e.target.value)
              }
              disabled={saving}
            />
          </label>
        </div>

        {/* OLD PRICE */}
        <div className="product-edit-field">
          <label>
            Old Price
            <input
              className="product-edit-input"
              type="number"
              step="0.01"
              min="0"
              value={formOldPrice ?? ""}
              onChange={(e) =>
                setFormOldPrice(
                  e.target.value || null
                )
              }
              disabled={saving}
            />
          </label>
        </div>

        {/* FEATURED */}
        <label className="product-edit-checkbox">
          <input
            type="checkbox"
            checked={formFeatured}
            onChange={(e) =>
              setFormFeatured(e.target.checked)
            }
            disabled={saving}
          />
          Featured product
        </label>

        <button
          className="product-edit-save"
          onClick={handleSubmit}
          disabled={saving || !isDirty}
        >
          {saving
            ? "Saving…"
            : !isDirty
            ? "No changes"
            : "Save changes"}
        </button>
      </div>
    </section>
  );
}
