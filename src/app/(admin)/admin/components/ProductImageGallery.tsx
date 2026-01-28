"use client";

import { useState } from "react";
import {
  uploadAdminProductImage,
  deleteAdminProductImage,
} from "@/lib/admin-api";

import "./product-image-gallery.css";

type ProductImage = {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
};

type Props = {
  productId: number;
  images: ProductImage[];
  onRefresh: () => void;
};

export default function ProductImageGallery({
  productId,
  images,
  onRefresh,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadAdminProductImage(productId, file);
      onRefresh();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(imageId: number) {
    if (!confirm("Delete this image permanently?")) return;

    setProcessingId(imageId);
    try {
      await deleteAdminProductImage(imageId);
      onRefresh();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Delete failed"
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="admin-image-section">
      <h3>Product Images</h3>

      {/* UPLOAD */}
      <div className="admin-image-upload">
        <label className="admin-upload-btn">
          Upload image
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>

        {uploading && (
          <span className="admin-uploading">
            Uploading…
          </span>
        )}
      </div>

      {/* EMPTY */}
      {images.length === 0 && (
        <div className="admin-image-empty">
          No images uploaded yet.
        </div>
      )}

      {/* GRID */}
      <div className="admin-image-grid">
        {images.map((img) => (
          <div
            key={img.id}
            className={[
              "admin-image-card",
              img.is_primary ? "primary" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <img
              src={img.image}
              alt={img.alt_text || ""}
            />

            {img.is_primary && (
              <span className="admin-image-badge">
                Primary
              </span>
            )}

            <div className="admin-image-actions">
              <button
                className="admin-action danger"
                disabled={processingId === img.id}
                onClick={() => handleDelete(img.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
