"use client";

import { useState } from "react";
import { createAdminProduct } from "@/lib/admin-api";
import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   TYPES
================================================== */

type Props = {
  onClose: () => void;
  onCreated: (productId: number) => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function CreateProductModal({
  onClose,
  onCreated,
}: Props) {
  const { showToast } = useAdminToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim() || !price.trim()) {
      showToast("All fields are required", "error");
      return;
    }

    setSaving(true);

    try {
      const product = await createAdminProduct({
        name: name.trim(),
        slug: slug.trim(),
        price,
      });

      showToast("Product created", "success");
      onCreated(product.id);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to create product",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div className="admin-modal">
        {/* ================= HEADER ================= */}
        <div className="admin-modal-header">
          <h3>Create Product</h3>
        </div>

        {/* ================= BODY ================= */}
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                setSlug(
                  value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")
                );
              }}
              placeholder="Product name"
            />
          </div>

          <div className="admin-form-group">
            <label>Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="product-slug"
            />
          </div>

          <div className="admin-form-group">
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="admin-modal-footer">
          <button
            className="admin-action"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="admin-action admin-action-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
