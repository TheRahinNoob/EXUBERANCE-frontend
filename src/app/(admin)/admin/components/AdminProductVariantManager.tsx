"use client";

import { useEffect, useState } from "react";
import AdminTable from "../components/AdminTable";

import {
  fetchAdminProductVariants,
  createAdminProductVariant,
  updateAdminVariantStock,
  deleteAdminVariant,
  type AdminProductVariant,
} from "@/lib/admin-api/product-variants";

type Props = {
  productId: number;
};

export default function AdminProductVariantManager({
  productId,
}: Props) {
  const [variants, setVariants] = useState<AdminProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [creating, setCreating] = useState(false);

  /* ==================================================
     LOAD VARIANTS
  ================================================== */

  const loadVariants = async () => {
    try {
      setLoading(true);
      setVariants(await fetchAdminProductVariants(productId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load variants"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVariants();
  }, [productId]);

  /* ==================================================
     CREATE VARIANT
  ================================================== */

  const handleCreate = async () => {
    if (!size || !color) return;

    setCreating(true);
    setError(null);

    try {
      const variant = await createAdminProductVariant(productId, {
        size,
        color,
        stock,
      });

      setVariants((prev) => [...prev, variant]);
      setSize("");
      setColor("");
      setStock(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  /* ==================================================
     UPDATE STOCK
  ================================================== */

  const handleStockChange = async (
    variantId: number,
    newStock: number
  ) => {
    try {
      await updateAdminVariantStock(variantId, newStock);

      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId ? { ...v, stock: newStock } : v
        )
      );
    } catch (err) {
      alert("Failed to update stock");
    }
  };

  /* ==================================================
     DELETE VARIANT
  ================================================== */

  const handleDelete = async (variantId: number) => {
    if (!confirm("Delete this variant?")) return;

    try {
      await deleteAdminVariant(variantId);
      setVariants((prev) =>
        prev.filter((v) => v.id !== variantId)
      );
    } catch {
      alert("Delete failed");
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <section style={{ marginBottom: 40 }}>
      <h3>Variants</h3>

      {error && (
        <div style={{ color: "#f87171", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <AdminTable>
        <thead>
          <tr>
            <th>Size</th>
            <th>Color</th>
            <th>Stock</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={4}>Loading…</td>
            </tr>
          )}

          {!loading && variants.length === 0 && (
            <tr>
              <td colSpan={4}>No variants</td>
            </tr>
          )}

          {variants.map((v) => (
            <tr key={v.id}>
              <td>{v.size}</td>
              <td>{v.color}</td>
              <td>
                <input
                  type="number"
                  value={v.stock}
                  min={0}
                  onChange={(e) =>
                    handleStockChange(v.id, Number(e.target.value))
                  }
                  style={{ width: 80 }}
                />
              </td>
              <td>
                <button onClick={() => handleDelete(v.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {/* CREATE */}
      <div style={{ marginTop: 16 }}>
        <h4>Add Variant</h4>

        <input
          placeholder="Size (S, M, L...)"
          value={size}
          onChange={(e) => setSize(e.target.value)}
        />
        <input
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />

        <button onClick={handleCreate} disabled={creating}>
          {creating ? "Adding…" : "Add Variant"}
        </button>
      </div>
    </section>
  );
}
