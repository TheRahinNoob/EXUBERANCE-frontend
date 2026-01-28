"use client";

import { useCallback, useEffect, useState } from "react";

import AdminTable from "../../../components/AdminTable";
import { useAdminToast } from "@/hooks/useAdminToast";

import {
  fetchAdminProductVariants,
  createAdminProductVariant,
  updateAdminVariantStock,
  deleteAdminVariant,
  type AdminProductVariant,
} from "@/lib/admin-api/product-variants";

/* ==================================================
   PROPS
================================================== */

type Props = {
  productId: number;
};

/* ==================================================
   COMPONENT
================================================== */

export default function AdminProductVariantManager({
  productId,
}: Props) {
  const { showToast } = useAdminToast();

  /* ==================================================
     STATE
  ================================================== */

  const [variants, setVariants] = useState<
    AdminProductVariant[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [creating, setCreating] = useState(false);

  /* ==================================================
     LOAD VARIANTS
  ================================================== */

  const loadVariants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminProductVariants(productId);
      setVariants(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load variants"
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  /* ==================================================
     CREATE VARIANT
  ================================================== */

  const handleCreate = async () => {
    if (creating) return;

    if (!size.trim() || !color.trim()) {
      showToast("Size and color are required", "error");
      return;
    }

    if (stock < 0) {
      showToast("Stock cannot be negative", "error");
      return;
    }

    setCreating(true);

    try {
      const variant = await createAdminProductVariant(
        productId,
        {
          size: size.trim(),
          color: color.trim(),
          stock,
        }
      );

      setVariants((prev) => [...prev, variant]);
      setSize("");
      setColor("");
      setStock(0);

      showToast("Variant created", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to create variant",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  /* ==================================================
     UPDATE STOCK (ON BLUR — SAFE)
  ================================================== */

  const handleStockUpdate = async (
    variantId: number,
    newStock: number
  ) => {
    if (newStock < 0) return;

    const snapshot = variants;

    // Optimistic UI
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, stock: newStock }
          : v
      )
    );

    try {
      await updateAdminVariantStock(variantId, newStock);
      showToast("Stock updated", "success");
    } catch (err) {
      setVariants(snapshot);
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to update stock",
        "error"
      );
    }
  };

  /* ==================================================
     DELETE VARIANT
  ================================================== */

  const handleDelete = async (variantId: number) => {
    const confirmed = window.confirm(
      "Delete this variant permanently?"
    );
    if (!confirmed) return;

    try {
      await deleteAdminVariant(variantId);
      setVariants((prev) =>
        prev.filter((v) => v.id !== variantId)
      );
      showToast("Variant deleted", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to delete variant",
        "error"
      );
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <section className="admin-section">
      <div className="admin-section-title">
        Product Variants
      </div>

      {/* ERROR */}
      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* CREATE FORM */}
      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Size</label>
          <input
            placeholder="e.g. M"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            disabled={creating}
          />
        </div>

        <div className="admin-form-group">
          <label>Color</label>
          <input
            placeholder="e.g. Black"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={creating}
          />
        </div>

        <div className="admin-form-group">
          <label>Stock</label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) =>
              setStock(Number(e.target.value))
            }
            disabled={creating}
          />
        </div>

        <div className="admin-form-group">
          <label>&nbsp;</label>
          <button
            className="admin-action admin-action-primary"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? "Adding…" : "Add Variant"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <AdminTable>
        <thead>
          <tr>
            <th align="left">Size</th>
            <th align="left">Color</th>
            <th align="left">Stock</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {!loading && variants.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="admin-table-empty"
              >
                No variants added yet
              </td>
            </tr>
          )}

          {variants.map((variant) => (
            <tr key={variant.id}>
              <td>{variant.size}</td>
              <td>{variant.color}</td>
              <td>
                <input
                  type="number"
                  min={0}
                  defaultValue={variant.stock}
                  className="admin-input-sm"
                  onBlur={(e) =>
                    handleStockUpdate(
                      variant.id,
                      Number(e.target.value)
                    )
                  }
                />
              </td>
              <td>
                <button
                  className="admin-action admin-action-danger"
                  onClick={() =>
                    handleDelete(variant.id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </section>
  );
}
