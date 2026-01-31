"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import AdminPageHeader from "../../components/AdminPageHeader";
import AdminStatusBadge from "../../components/AdminStatusBadge";
import AdminRowActions from "../../components/AdminRowActions";
import AdminTable from "../../components/AdminTable";
import ConfirmActionModal from "../../components/ConfirmActionModal";

import {
  fetchAdminOrderDetail,
  fetchAdminOrderAudit,
  updateAdminOrderStatus,
  type AdminOrderDetail,
  type AdminOrderAuditLog,
} from "@/lib/admin-api";

/* ==================================================
   TYPES
================================================== */

type OrderAction = "confirm" | "ship" | "deliver" | "cancel";

/* ==================================================
   UI STATE MACHINE (SAFE MIRROR OF BACKEND)
================================================== */

const ALLOWED_ACTIONS: Record<string, OrderAction[]> = {
  pending: ["confirm", "cancel"],
  confirmed: ["ship", "cancel"],
  shipped: ["deliver"],
  delivered: [],
  cancelled: [],
};

const ACTION_LABELS: Record<OrderAction, string> = {
  confirm: "Confirm order",
  ship: "Mark as shipped",
  deliver: "Mark as delivered",
  cancel: "Cancel order",
};

const ACTION_DESCRIPTIONS: Record<OrderAction, string> = {
  confirm: "This will confirm the order and lock inventory.",
  ship: "This indicates the order has been handed to courier.",
  deliver: "This marks the order as successfully delivered.",
  cancel:
    "This will cancel the order and restore stock. This action cannot be undone.",
};

/* ==================================================
   PAGE
================================================== */

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const rawId = params?.id;
  const orderId = Number(rawId);

  /* ================= DATA STATE ================= */

  const [order, setOrder] =
    useState<AdminOrderDetail | null>(null);
  const [auditLogs, setAuditLogs] =
    useState<AdminOrderAuditLog[]>([]);

  /* ================= UI STATE ================= */

  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const [pendingAction, setPendingAction] =
    useState<OrderAction | null>(null);

  /* ==================================================
     LOAD ORDER + AUDIT
  ================================================== */

  const loadOrder = useCallback(async () => {
    if (!Number.isFinite(orderId)) {
      setError("Invalid order ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [orderData, auditData] =
        await Promise.all([
          fetchAdminOrderDetail(orderId),
          fetchAdminOrderAudit(orderId),
        ]);

      if (!orderData || !Array.isArray(auditData)) {
        throw new Error("Invalid order response");
      }

      setOrder(orderData);
      setAuditLogs(auditData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load order"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  /* ==================================================
     CONFIRMED ACTION EXECUTION
  ================================================== */

  const executeAction = async () => {
    if (!order || !pendingAction) return;

    setLoadingAction(true);

    try {
      await updateAdminOrderStatus(
        order.id,
        pendingAction
      );
      setPendingAction(null);
      await loadOrder();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order"
      );
    } finally {
      setLoadingAction(false);
    }
  };

  /* ==================================================
     DERIVED STATE
  ================================================== */

  const allowedActions = useMemo<OrderAction[]>(
    () =>
      order
        ? ALLOWED_ACTIONS[order.status] ?? []
        : [],
    [order]
  );

  /* ==================================================
     STATES
  ================================================== */

  if (loading) {
    return (
      <div className="admin-table-state">
        Loading order…
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-table-state admin-table-error">
        Error: {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-table-state">
        Order not found.
      </div>
    );
  }

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={`Order ${order.reference}`}
        description="View and manage order lifecycle"
      />

      {/* ================= ORDER OVERVIEW ================= */}
      <div className="admin-section">
        <div className="admin-section-title">
          Order Overview
        </div>

        <div className="admin-detail-grid">
          <div className="admin-detail-key">
            Status
          </div>
          <div className="admin-detail-value">
            <AdminStatusBadge
              status={order.status}
            />
          </div>

          <div className="admin-detail-key">
            Total
          </div>
          <div className="admin-detail-value">
            {order.total}
          </div>

          <div className="admin-detail-key">
            Placed at
          </div>
          <div className="admin-detail-value">
            {new Date(
              order.created_at
            ).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className="admin-section">
        <div className="admin-section-title">
          Customer
        </div>

        <div className="admin-detail-grid">
          <div className="admin-detail-key">
            Name
          </div>
          <div className="admin-detail-value">
            {order.customer.name}
          </div>

          <div className="admin-detail-key">
            Phone
          </div>
          <div className="admin-detail-value">
            {order.customer.phone}
          </div>

          <div className="admin-detail-key">
            Address
          </div>
          <div className="admin-detail-value">
            {order.customer.address}
          </div>
        </div>
      </div>

      {/* ================= ITEMS ================= */}
      <div className="admin-section">
        <div className="admin-section-title">
          Items
        </div>

        <div className="admin-items-table">
          <AdminTable>
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Product">
                    {item.product_name}
                  </td>

                  <td data-label="Variant">
                    {item.size} / {item.color}
                  </td>

                  <td
                    data-label="Price"
                    data-numeric="true"
                  >
                    {item.price}
                  </td>

                  <td
                    data-label="Qty"
                    data-numeric="true"
                  >
                    {item.quantity}
                  </td>

                  <td
                    data-label="Subtotal"
                    data-numeric="true"
                  >
                    {item.subtotal}
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </div>
      </div>

      {/* ================= ORDER ACTIONS ================= */}
      {allowedActions.length > 0 && (
        <div className="admin-section">
          <div className="admin-section-title">
            Order Actions
          </div>

          <div className="admin-actions-bar">
            <AdminRowActions
              actions={allowedActions.map(
                (action) => ({
                  label:
                    action.charAt(0).toUpperCase() +
                    action.slice(1),
                  danger: action === "cancel",
                  disabled: loadingAction,
                  onClick: () =>
                    setPendingAction(action),
                })
              )}
            />
          </div>
        </div>
      )}

      {/* ================= TIMELINE ================= */}
      <div className="admin-section">
        <div className="admin-section-title">
          Order Timeline
        </div>

        {auditLogs.length === 0 ? (
          <div className="cell-muted">
            No audit records found.
          </div>
        ) : (
          <ul className="admin-timeline">
            {auditLogs.map((log, idx) => (
              <li
                key={idx}
                className="admin-timeline-item"
              >
                <div className="cell-strong">
                  {log.previous_status ??
                    "created"}{" "}
                  → {log.new_status}
                </div>
                <div className="cell-secondary">
                  {log.actor_type} ·{" "}
                  {log.actor_identifier} ·{" "}
                  {new Date(
                    log.created_at
                  ).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      <ConfirmActionModal
        open={Boolean(pendingAction)}
        title={
          pendingAction
            ? ACTION_LABELS[pendingAction]
            : ""
        }
        description={
          pendingAction
            ? ACTION_DESCRIPTIONS[pendingAction]
            : ""
        }
        danger={pendingAction === "cancel"}
        loading={loadingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={executeAction}
      />
    </div>
  );
}
