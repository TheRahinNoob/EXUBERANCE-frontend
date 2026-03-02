"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminToolbar from "../components/AdminToolbar";
import AdminTable from "../components/AdminTable";
import AdminStatusBadge from "../components/AdminStatusBadge";
import AdminRowActions from "../components/AdminRowActions";

import {
  fetchAdminOrders,
  type AdminOrder,
  type PaginatedResponse,
} from "@/lib/admin-api";

/* ==================================================
   TYPES — LOCAL, STRICT, BACKEND-ALIGNED
================================================== */

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

/* ==================================================
   CONSTANTS
================================================== */

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

/* ==================================================
   HELPERS
================================================== */

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function compactMoney(value: string) {
  // Keep it simple + safe: backend already sends string.
  // If you later want currency formatting, we can add Intl.NumberFormat
  // once you confirm currency + locale rules.
  return value ?? "—";
}

function makeVariantLabel(size?: string, color?: string) {
  const parts = [size, color].filter(Boolean);
  return parts.length ? parts.join(" / ") : "";
}

/* ==================================================
   PAGE
================================================== */

export default function AdminOrdersPage() {
  const router = useRouter();

  /* ================= STATE ================= */

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [meta, setMeta] =
    useState<PaginatedResponse<AdminOrder>["meta"] | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= DERIVED ================= */

  const isEmpty = useMemo(
    () => !loading && !error && orders.length === 0,
    [loading, error, orders.length]
  );

  const showingRange = useMemo(() => {
    if (!meta || orders.length === 0) return null;

    const start = (meta.page - 1) * meta.page_size + 1;
    const end = start + orders.length - 1;

    return { start, end };
  }, [meta, orders.length]);

  /* ================= DATA ================= */

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminOrders({
        status: statusFilter,
        search: search || undefined,
        page,
        page_size: PAGE_SIZE,
      });

      if (!response || !Array.isArray(response.items) || !response.meta) {
        throw new Error("Invalid orders response format");
      }

      setOrders(response.items);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  /* ================= HANDLERS ================= */

  const handleStatusChange = (value: string) => {
    setPage(1);
    setStatusFilter(value ? (value as OrderStatus) : undefined);
  };

  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  /* ================= RENDER HELPERS ================= */

  const renderItemsCell = (order: AdminOrder) => {
    const items = order.items ?? [];

    if (items.length === 0) {
      return <span className="cell-muted">—</span>;
    }

    return (
      <div className="order-items">
        {items.map((item) => {
          const variant = makeVariantLabel(item.size, item.color);

          return (
            <div key={item.id} className="order-item">
              <div className="order-item-top">
                <span className="order-item-name">{item.product_name}</span>
                <span className="order-item-price">
                  {compactMoney(item.price)}
                </span>
              </div>

              <div className="order-item-meta">
                {variant ? <span className="order-item-variant">{variant}</span> : null}
                <span className="order-item-qty">×{item.quantity}</span>
                <span className="order-item-subtotal">
                  Subtotal: {compactMoney(item.subtotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ================= RENDER ================= */

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Orders"
        description="Manage and track customer orders"
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={handleSearchChange}
        statusValue={statusFilter}
        statusOptions={STATUS_OPTIONS}
        onStatusChange={handleStatusChange}
        disabled={loading}
      />

      <AdminTable>
        <thead>
          <tr>
            <th style={{ width: 150 }}>Reference</th>
            <th style={{ width: 220 }}>Customer</th>
            <th>Products</th>
            <th style={{ width: 140 }}>Status</th>
            <th style={{ width: 120 }}>Total</th>
            <th style={{ width: 130 }}>Date</th>
            <th className="align-right" style={{ width: 120 }}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={7} className="admin-table-state">
                Loading orders…
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td colSpan={7} className="admin-table-state admin-table-error">
                {error}
              </td>
            </tr>
          )}

          {isEmpty && (
            <tr>
              <td colSpan={7} className="admin-table-state">
                No orders found
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            orders.map((order) => (
              <tr key={order.id}>
                <td data-label="Reference" className="mono cell-strong">
                  {order.reference}
                </td>

                <td data-label="Customer">
                  <div className="cell-primary">{order.customer_name}</div>
                  <div className="cell-secondary">{order.customer_phone}</div>
                </td>

                <td data-label="Products">{renderItemsCell(order)}</td>

                <td data-label="Status">
                  <AdminStatusBadge status={order.status} />
                </td>

                <td data-label="Total" data-numeric="true" className="cell-strong">
                  {compactMoney(order.total)}
                </td>

                <td data-label="Date" className="cell-muted">
                  {formatDate(order.created_at)}
                </td>

                <td data-label="Actions" className="align-right">
                  <AdminRowActions
                    actions={[
                      {
                        label: "View",
                        onClick: () => router.push(`/admin/orders/${order.id}`),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </AdminTable>

      {meta && !loading && showingRange && (
        <div className="admin-pagination">
          <div>
            Showing {showingRange.start}–{showingRange.end} of {meta.total}
          </div>

          <div className="admin-pagination-actions">
            <button
              disabled={!meta.has_prev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>

            <button disabled={!meta.has_next} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}