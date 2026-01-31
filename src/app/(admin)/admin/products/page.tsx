"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable from "../components/AdminTable";
import AdminStatusBadge from "../components/AdminStatusBadge";
import ConfirmActionModal from "../components/ConfirmActionModal";
import CreateProductModal from "./components/CreateProductModal";
import "./admin-products.css";
import {
  fetchAdminProducts,
  deactivateAdminProduct,
} from "@/lib/admin-api";

import type {
  AdminProduct,
  PaginatedResponse,
} from "@/lib/admin-api";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   CONSTANTS
================================================== */

const PAGE_SIZE = 20;

/* ==================================================
   PAGE — ADMIN PRODUCTS
================================================== */

export default function AdminProductsPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();

  /* ================= STATE ================= */

  const [products, setProducts] =
    useState<AdminProduct[]>([]);
  const [meta, setMeta] =
    useState<PaginatedResponse<AdminProduct>["meta"] | null>(
      null
    );

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [selectedIds, setSelectedIds] =
    useState<Set<number>>(new Set());

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [confirmDeactivateIds, setConfirmDeactivateIds] =
    useState<number[] | null>(null);

  const [processing, setProcessing] =
    useState(false);

  /* ================= DERIVED ================= */

  const isEmpty =
    !loading && !error && products.length === 0;

  const allSelected =
    products.length > 0 &&
    products.every((p) => selectedIds.has(p.id));

  const selectedProducts = useMemo(
    () =>
      products.filter((p) =>
        selectedIds.has(p.id)
      ),
    [products, selectedIds]
  );

  /* ================= DATA LOAD ================= */

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminProducts({
        page,
        page_size: PAGE_SIZE,
      });

      if (!res || !res.meta) {
        throw new Error("Invalid response");
      }

      setProducts([...res.items]); // clone readonly
      setMeta(res.meta);
      setSelectedIds(new Set());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* ================= SELECTION ================= */

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id)
        ? next.delete(id)
        : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      allSelected
        ? new Set()
        : new Set(products.map((p) => p.id))
    );
  };

  /* ================= DEACTIVATION ================= */

  const confirmDeactivate = async () => {
    if (!confirmDeactivateIds) return;

    setProcessing(true);

    let success = 0;
    let failure = 0;

    for (const id of confirmDeactivateIds) {
      const product = products.find(
        (p) => p.id === id
      );

      // Idempotent safety
      if (!product || !product.is_active) continue;

      try {
        await deactivateAdminProduct(id);

        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, is_active: false }
              : p
          )
        );

        success++;
      } catch {
        failure++;
      }
    }

    setProcessing(false);
    setConfirmDeactivateIds(null);
    setSelectedIds(new Set());

    if (success) {
      showToast(
        `${success} product(s) deactivated`,
        "success"
      );
    }

    if (failure) {
      showToast(
        `${failure} product(s) failed`,
        "error"
      );
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Products"
        description="Manage store products"
        rightSlot={
          <div className="admin-actions">
            {selectedProducts.some((p) => p.is_active) && (
              <button
                className="admin-action admin-action-danger"
                onClick={() =>
                  setConfirmDeactivateIds(
                    selectedProducts
                      .filter((p) => p.is_active)
                      .map((p) => p.id)
                  )
                }
              >
                Deactivate Selected
              </button>
            )}

            <button
              className="admin-action admin-action-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Add Product
            </button>
          </div>
        }
      />

      <AdminTable>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={7}>Loading…</td>
            </tr>
          )}

          {error && (
            <tr>
              <td colSpan={7}>{error}</td>
            </tr>
          )}

          {isEmpty && (
            <tr>
              <td colSpan={7}>No products found</td>
            </tr>
          )}

          {!loading &&
            !error &&
            products.map((product) => (
              <tr
                key={product.id}
                style={{
                  opacity: product.is_active
                    ? 1
                    : 0.45,
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(
                      product.id
                    )}
                    onChange={() =>
                      toggleSelect(product.id)
                    }
                  />
                </td>

                <td>
                  <button
                    className="admin-link"
                    onClick={() =>
                      router.push(
                        `/admin/products/${product.id}`
                      )
                    }
                  >
                    {product.name}
                  </button>
                </td>

                <td>{product.price}</td>
                <td>{product.total_stock}</td>

                <td>
                  <AdminStatusBadge
                    status={
                      product.is_active
                        ? "confirmed"
                        : "cancelled"
                    }
                  />
                </td>

                <td>
                  {new Date(
                    product.created_at
                  ).toLocaleDateString()}
                </td>

                <td>
                  {product.is_active && (
                    <button
                      className="admin-link-danger"
                      onClick={() =>
                        setConfirmDeactivateIds([
                          product.id,
                        ])
                      }
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </AdminTable>

      {meta && (
        <div className="admin-pagination">
          <button
            disabled={!meta.has_prev}
            onClick={() =>
              setPage((p) => Math.max(1, p - 1))
            }
          >
            Prev
          </button>

          <span>
            Page {meta.page} of{" "}
            {Math.ceil(
              meta.total / meta.page_size
            )}
          </span>

          <button
            disabled={!meta.has_next}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(id) => {
            setShowCreateModal(false);
            router.push(`/admin/products/${id}`);
          }}
        />
      )}

      <ConfirmActionModal
        open={!!confirmDeactivateIds}
        title="Deactivate product?"
        description="This will remove the product from the store. Orders remain intact."
        confirmLabel="Deactivate"
        danger
        loading={processing}
        onClose={() =>
          !processing &&
          setConfirmDeactivateIds(null)
        }
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
