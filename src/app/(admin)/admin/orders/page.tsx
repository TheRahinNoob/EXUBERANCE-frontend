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

const STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

/* ==================================================
   PAGE
================================================== */

export default function AdminOrdersPage() {
  const router = useRouter();

  /* ================= STATE ================= */

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [meta, setMeta] =
    useState<PaginatedResponse<AdminOrder>["meta"] | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<OrderStatus | undefined>();
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

      if (
        !response ||
        !Array.isArray(response.items) ||
        !response.meta
      ) {
        throw new Error("Invalid orders response format");
      }

      setOrders(response.items);
      setMeta(response.meta);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders"
      );
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
    setStatusFilter(
      value ? (value as OrderStatus) : undefined
    );
  };

  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
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
            <th>Reference</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
            <th className="align-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} className="admin-table-state">
                Loading orders…
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
              <td colSpan={6} className="admin-table-state">
                No orders found
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            orders.map((order) => (
              <tr key={order.id}>
                <td data-label="Reference" className="mono">
                  {order.reference}
                </td>

                <td data-label="Customer">
                  <div className="cell-primary">
                    {order.customer_name}
                  </div>
                  <div className="cell-secondary">
                    {order.customer_phone}
                  </div>
                </td>

                <td data-label="Status">
                  <AdminStatusBadge status={order.status} />
                </td>

                <td
                  data-label="Total"
                  data-numeric="true"
                  className="cell-strong"
                >
                  {order.total}
                </td>

                <td
                  data-label="Date"
                  className="cell-muted"
                >
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </td>

                <td
                  data-label="Actions"
                  className="align-right"
                >
                  <AdminRowActions
                    actions={[
                      {
                        label: "View",
                        onClick: () =>
                          router.push(
                            `/admin/orders/${order.id}`
                          ),
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
            Showing {showingRange.start}–{showingRange.end} of{" "}
            {meta.total}
          </div>

          <div className="admin-pagination-actions">
            <button
              disabled={!meta.has_prev}
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
            >
              Prev
            </button>

            <button
              disabled={!meta.has_next}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
