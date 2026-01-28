"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchAdminProductImages,
  uploadAdminProductImage,
  setAdminProductPrimaryImage,
  deleteAdminProductImage,
  type AdminProductImage,
} from "@/lib/admin-api";

/* ==================================================
   PROPS
================================================== */

type Props = {
  productId: number;
};

/* ==================================================
   COMPONENT
================================================== */

export default function ImageGallery({ productId }: Props) {
  /* ------------------------------
     STATE
  ------------------------------ */

  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------
     LOAD IMAGES
  ------------------------------ */

  const loadImages = useCallback(async () => {
    if (!Number.isFinite(productId)) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminProductImages(productId);

      if (!Array.isArray(data)) {
        throw new Error("Invalid image response format");
      }

      setImages(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load images"
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  /* ------------------------------
     UPLOAD IMAGE
  ------------------------------ */

  const handleUpload = async (
    file: File,
    isPrimary = false
  ) => {
    setUploading(true);
    setError(null);

    try {
      const newImage = await uploadAdminProductImage(
        productId,
        file,
        {
          is_primary: isPrimary,
        }
      );

      setImages((prev) => {
        const cleaned = isPrimary
          ? prev.map((img) => ({
              ...img,
              is_primary: false,
            }))
          : prev;

        return [...cleaned, newImage];
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  /* ------------------------------
     SET PRIMARY IMAGE
  ------------------------------ */

  const handleSetPrimary = async (imageId: number) => {
    setError(null);

    // Optimistic UI update
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }))
    );

    try {
      await setAdminProductPrimaryImage(imageId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set primary image"
      );

      // Rollback
      loadImages();
    }
  };

  /* ------------------------------
     DELETE IMAGE
  ------------------------------ */

  const handleDelete = async (imageId: number) => {
    const confirmed = window.confirm(
      "Delete this image permanently?"
    );

    if (!confirmed) return;

    setError(null);

    const snapshot = images;
    setImages((prev) => prev.filter((i) => i.id !== imageId));

    try {
      await deleteAdminProductImage(imageId);
    } catch (err) {
      setImages(snapshot);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete image"
      );
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <section style={{ marginTop: 32 }}>
      <h3>Product Images</h3>

      {error && (
        <div style={{ color: "#f87171", marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* UPLOAD */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        {uploading && <span> Uploading…</span>}
      </div>

      {/* IMAGE GRID */}
      {loading ? (
        <div>Loading images…</div>
      ) : images.length === 0 ? (
        <div>No images uploaded</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 140px)",
            gap: 12,
          }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                border: img.is_primary
                  ? "2px solid #2563eb"
                  : "1px solid #e5e7eb",
                padding: 8,
                borderRadius: 6,
              }}
            >
              <img
                src={img.image}
                alt={img.alt_text || "Product image"}
                style={{
                  width: "100%",
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                {!img.is_primary && (
                  <button
                    onClick={() =>
                      handleSetPrimary(img.id)
                    }
                    style={{ fontSize: 12 }}
                  >
                    Set primary
                  </button>
                )}

                <button
                  onClick={() => handleDelete(img.id)}
                  style={{
                    fontSize: 12,
                    color: "#dc2626",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
