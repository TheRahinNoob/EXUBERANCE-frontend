"use client";

import { useCallback, useEffect, useState } from "react";
import "./product-image-manager.css";

import {
  fetchAdminProductImages,
  uploadAdminProductImage,
  deleteAdminProductImage,
  setAdminProductPrimaryImage,
  type AdminProductImage,
} from "@/lib/admin-api";

import { useAdminToast } from "@/hooks/useAdminToast";

type Props = {
  productId: number;
  onPrimaryImageChange?: (imageUrl: string | null) => void;
};

export default function ProductImageManager({
  productId,
  onPrimaryImageChange,
}: Props) {
  const { showToast } = useAdminToast();

  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    if (!Number.isFinite(productId)) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminProductImages(productId);
      setImages(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load images"
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  /* ================= UPLOAD ================= */

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadAdminProductImage(productId, file);

        setImages((prev) => {
          const normalized = uploaded.is_primary
            ? prev.map((img) => ({ ...img, is_primary: false }))
            : prev;
          return [...normalized, uploaded];
        });

        if (uploaded.is_primary) {
          onPrimaryImageChange?.(uploaded.image);
        }
      }

      showToast("Image uploaded", "success");
      e.target.value = "";
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  /* ================= SET PRIMARY ================= */

  const handleSetPrimary = async (image: AdminProductImage) => {
    if (processingId) return;

    setProcessingId(image.id);
    setError(null);

    const snapshot = images;

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === image.id,
      }))
    );

    onPrimaryImageChange?.(image.image);

    try {
      await setAdminProductPrimaryImage(image.id);
      showToast("Primary image updated", "success");
    } catch {
      setImages(snapshot);
      const prevPrimary = snapshot.find((i) => i.is_primary);
      onPrimaryImageChange?.(prevPrimary?.image ?? null);
      showToast("Failed to set primary image", "error");
    } finally {
      setProcessingId(null);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (image: AdminProductImage) => {
    if (!window.confirm("Delete this image permanently?")) return;
    if (processingId) return;

    setProcessingId(image.id);
    setError(null);

    const snapshot = images;
    const remaining = snapshot.filter((i) => i.id !== image.id);

    setImages(remaining);

    if (image.is_primary) {
      onPrimaryImageChange?.(remaining[0]?.image ?? null);
    }

    try {
      await deleteAdminProductImage(image.id);
      showToast("Image deleted", "success");
    } catch {
      setImages(snapshot);
      const prevPrimary = snapshot.find((i) => i.is_primary);
      onPrimaryImageChange?.(prevPrimary?.image ?? null);
      showToast("Failed to delete image", "error");
    } finally {
      setProcessingId(null);
    }
  };

  /* ================= RENDER ================= */

  return (
    <section className="admin-image-section">
      <h3 className="admin-section-title">Product Images</h3>

      <div className="admin-image-upload">
        <label className="admin-upload-btn">
          Upload images
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleUpload}
            hidden
          />
        </label>

        {uploading && <span className="admin-uploading">Uploading…</span>}
      </div>

      {error && <div className="admin-error">{error}</div>}

      {!loading && images.length === 0 && (
        <div className="admin-muted">No images uploaded yet.</div>
      )}

      {loading ? (
        <div className="admin-muted">Loading images…</div>
      ) : (
        <div className="admin-image-grid">
          {images.map((img) => (
            <div
              key={img.id}
              className={[
                "admin-image-card",
                img.is_primary ? "primary" : "",
              ].join(" ")}
            >
              <img src={img.image} alt={img.alt_text || ""} />

              {img.is_primary && (
                <span className="admin-image-badge">Primary</span>
              )}

              <div className="admin-image-actions">
                {!img.is_primary && (
                  <button
                    className="admin-action"
                    disabled={processingId === img.id}
                    onClick={() => handleSetPrimary(img)}
                  >
                    Set Primary
                  </button>
                )}

                <button
                  className="admin-action danger"
                  disabled={processingId === img.id}
                  onClick={() => handleDelete(img)}
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
