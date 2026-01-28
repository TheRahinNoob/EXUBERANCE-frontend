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
import CreateProductModal from "./components/CreateProductModal";

import {
  fetchAdminProducts,
  toggleAdminProductStatus,
  type AdminProduct,
  type PaginatedResponse,
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

  /* =========================
     STATE
  ========================= */

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
    useState<Set<number>>(() => new Set());

  const [bulkAction, setBulkAction] =
    useState<"activate" | "deactivate" | null>(
      null
    );

  const [processing, setProcessing] =
    useState(false);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  /* =========================
     DERIVED STATE
  ========================= */

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

  /* =========================
     DATA LOADER
  ========================= */

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminProducts({
        page,
        page_size: PAGE_SIZE,
      });

      if (
        !res ||
        !Array.isArray(res.items) ||
        !res.meta
      ) {
        throw new Error(
          "Invalid products response format"
        );
      }

      setProducts(res.items);
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

  /* =========================
     SELECTION HANDLERS
  ========================= */

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

  /* =========================
     BULK ACTION EXECUTION
  ========================= */

  const executeBulkAction = async () => {
    if (
      !bulkAction ||
      selectedProducts.length === 0
    ) {
      setBulkAction(null);
      return;
    }

    setProcessing(true);

    let successCount = 0;
    let failureCount = 0;

    for (const product of selectedProducts) {
      const shouldActivate =
        bulkAction === "activate";

      if (product.is_active === shouldActivate) {
        continue;
      }

      try {
        const res =
          await toggleAdminProductStatus(
            product.id
          );

        setProducts((prev) =>
          prev.map((p) =>
            p.id === res.id
              ? {
                  ...p,
                  is_active: res.is_active,
                }
              : p
          )
        );

        successCount++;
      } catch {
        failureCount++;
      }
    }

    setProcessing(false);
    setBulkAction(null);
    setSelectedIds(new Set());

    if (successCount > 0) {
      showToast(
        `${successCount} product(s) updated`,
        "success"
      );
    }

    if (failureCount > 0) {
      showToast(
        `${failureCount} product(s) failed to update`,
        "error"
      );
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Products"
        description="Manage store products"
        rightSlot={
          <button
            className="admin-action admin-action-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Add Product
          </button>
        }
      />

      {/* ================= TABLE ================= */}
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
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={6}
                className="admin-table-state"
              >
                Loading products…
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td
                colSpan={6}
                className="admin-table-state admin-table-error"
              >
                {error}
              </td>
            </tr>
          )}

          {isEmpty && (
            <tr>
              <td
                colSpan={6}
                className="admin-table-state"
              >
                No products found
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            products.map((product) => (
              <tr key={product.id}>
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
              </tr>
            ))}
        </tbody>
      </AdminTable>

      {/* ================= PAGINATION ================= */}
      {meta && (
        <div className="admin-pagination">
          <div>
            Page {meta.page} of{" "}
            {Math.ceil(
              meta.total / meta.page_size
            )}
          </div>

          <div className="admin-pagination-actions">
            <button
              disabled={!meta.has_prev}
              onClick={() =>
                setPage((p) =>
                  Math.max(1, p - 1)
                )
              }
            >
              Prev
            </button>

            <button
              disabled={!meta.has_next}
              onClick={() =>
                setPage((p) => p + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ================= CREATE MODAL ================= */}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(id) => {
            setShowCreateModal(false);
            router.push(`/admin/products/${id}`);
          }}
        />
      )}
    </div>
  );
}
