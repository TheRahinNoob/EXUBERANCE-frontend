"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import "./product-detail.css";

import AdminPageHeader from "../../components/AdminPageHeader";
import ProductImageManager from "../../components/ProductImageManager";
import EditProductForm from "./components/EditProductForm";
import AdminProductVariantManager from "./components/AdminProductVariantManager";
import AdminProductAttributeManager from "./components/AdminProductAttributeManager";
import ProductCategoryManager from "./components/ProductCategoryManager";
import ProductDescriptionEditor from "./components/ProductDescriptionEditor";

import {
  fetchAdminProductDetail,
  updateAdminProductBasicInfo,
  updateAdminProductDescription,
  deactivateAdminProduct,
  type AdminProductDetail,
} from "@/lib/admin-api";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   PAGE — ADMIN PRODUCT DETAIL
================================================== */

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useAdminToast();

  /* ================= PRODUCT ID ================= */

  const productId = useMemo<number | null>(() => {
    const parsed = Number(params?.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params?.id]);

  /* ================= STATE ================= */

  const [product, setProduct] =
    useState<AdminProductDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [savingBasic, setSavingBasic] =
    useState(false);
  const [savingDescription, setSavingDescription] =
    useState(false);
  const [changingStatus, setChangingStatus] =
    useState(false);

  const [editingBasic, setEditingBasic] =
    useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] =
    useState("");

  /* ================= LOAD PRODUCT ================= */

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data =
        await fetchAdminProductDetail(productId);

      setProduct(data);
      setName(data.name);
      setSlug(data.slug);
      setDescription(data.description ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  /* ================= BASIC INFO ================= */

  const handleSaveBasicInfo = async () => {
    if (!product || savingBasic) return;

    if (!name.trim() || !slug.trim()) {
      showToast("Name and slug are required", "error");
      return;
    }

    setSavingBasic(true);

    try {
      const updated =
        await updateAdminProductBasicInfo(
          product.id,
          {
            name: name.trim(),
            slug: slug.trim(),
          }
        );

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              name: updated.name,
              slug: updated.slug,
            }
          : prev
      );

      setEditingBasic(false);
      showToast("Basic info updated", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to update basic info",
        "error"
      );
    } finally {
      setSavingBasic(false);
    }
  };

  /* ================= DESCRIPTION ================= */

  const handleSaveDescription = async () => {
    if (!product || savingDescription) return;

    setSavingDescription(true);

    try {
      await updateAdminProductDescription(
        product.id,
        description
      );
      showToast("Description updated", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to update description",
        "error"
      );
    } finally {
      setSavingDescription(false);
    }
  };

  /* ================= DEACTIVATION ================= */

  const handleDeactivate = async () => {
    if (!product || changingStatus || !product.is_active)
      return;

    setChangingStatus(true);

    try {
      await deactivateAdminProduct(product.id);

      setProduct((prev) =>
        prev ? { ...prev, is_active: false } : prev
      );

      showToast("Product deactivated", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to deactivate product",
        "error"
      );
    } finally {
      setChangingStatus(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Product Detail"
        description="View and manage product information"
      />

      <button
        className="admin-link"
        onClick={() => router.push("/admin/products")}
      >
        ← Back to products
      </button>

      {loading && (
        <div className="admin-table-state">
          Loading product…
        </div>
      )}

      {!loading && error && (
        <div className="admin-table-error">{error}</div>
      )}

      {!loading && !error && product && (
        <>
          {/* ========== BASIC INFO ========== */}
          <div className="admin-section">
            <div className="admin-section-title">
              Basic Information
            </div>

            {!editingBasic ? (
              <>
                <div className="admin-detail-grid">
                  <div className="admin-detail-key">
                    Name
                  </div>
                  <div className="admin-detail-value">
                    {product.name}
                  </div>

                  <div className="admin-detail-key">
                    Slug
                  </div>
                  <div className="admin-detail-value mono">
                    {product.slug}
                  </div>
                </div>

                <div className="admin-actions-bar">
                  <button
                    className="admin-action"
                    onClick={() =>
                      setEditingBasic(true)
                    }
                  >
                    Edit
                  </button>

                  {product.is_active && (
                    <button
                      className="admin-action admin-action-danger"
                      onClick={handleDeactivate}
                      disabled={changingStatus}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="admin-form-group">
                  <label>Name</label>
                  <input
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Slug</label>
                  <input
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value)
                    }
                  />
                </div>

                <div className="admin-actions-bar">
                  <button
                    className="admin-action admin-action-primary"
                    onClick={handleSaveBasicInfo}
                    disabled={savingBasic}
                  >
                    {savingBasic ? "Saving…" : "Save"}
                  </button>

                  <button
                    className="admin-action"
                    onClick={() => {
                      setEditingBasic(false);
                      setName(product.name);
                      setSlug(product.slug);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ========== DESCRIPTION ========== */}
          <div className="admin-section">
            <div className="admin-section-title">
              Description
            </div>

            <ProductDescriptionEditor
              value={description}
              onChange={setDescription}
            />

            <div className="admin-actions-bar">
              <button
                className="admin-action admin-action-primary"
                onClick={handleSaveDescription}
                disabled={savingDescription}
              >
                {savingDescription
                  ? "Saving…"
                  : "Save Description"}
              </button>
            </div>
          </div>

          {/* ========== SECONDARY SECTIONS ========== */}
          <EditProductForm
            productId={product.id}
            price={String(product.price)}
            old_price={
              product.old_price !== null
                ? String(product.old_price)
                : null
            }
            is_featured={product.is_featured}
            onUpdated={(updated) =>
              setProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      price: updated.price,
                      old_price: updated.old_price,
                      is_featured:
                        updated.is_featured,
                    }
                  : prev
              )
            }
          />

          <ProductCategoryManager
            productId={product.id}
            initialCategoryIds={product.categories.map(
              (c) => c.id
            )}
          />

          <ProductImageManager
            productId={product.id}
            onPrimaryImageChange={(url) =>
              setProduct((prev) =>
                prev
                  ? { ...prev, main_image: url }
                  : prev
              )
            }
          />

          <AdminProductVariantManager
            productId={product.id}
          />

          <AdminProductAttributeManager
            productId={product.id}
          />
        </>
      )}
    </div>
  );
}
