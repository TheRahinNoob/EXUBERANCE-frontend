"use client";

import { useEffect, useState } from "react";
import "./attributes-page.css";

import { useAdminToast } from "@/hooks/useAdminToast";

import AttributeTable from "./components/AttributeTable";

import {
  fetchAdminAttributeDefinitions,
  createAdminAttributeDefinition,
  updateAdminAttributeDefinition,
  deleteAdminAttributeDefinition,
  type AdminProductAttributeDefinition,
} from "@/lib/admin-api/product-attributes";

/* ==================================================
   PAGE: ADMIN ATTRIBUTE DEFINITIONS
==================================================
 PRINCIPLES:
 - Backend is single source of truth
 - Defensive state updates
 - Dark / glass admin UI
================================================== */

export default function AdminAttributesPage() {
  const { showToast } = useAdminToast();

  /* ================= STATE ================= */

  const [items, setItems] = useState<
    AdminProductAttributeDefinition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ================= LOAD ================= */

  const loadAttributes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminAttributeDefinitions();

      // 🔒 HARD SAFETY
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load attributes";

      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    const name = prompt(
      "Attribute name (e.g. Fabric, GSM, Fit)"
    );

    if (!name || !name.trim()) return;

    try {
      const created =
        await createAdminAttributeDefinition({
          name: name.trim(),
        });

      setItems((prev) => [...prev, created]);
      showToast("Attribute created", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Create failed",
        "error"
      );
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async (
    id: number,
    payload: { name?: string; ordering?: number }
  ) => {
    if (busyId !== null) return;

    const existing = items.find((i) => i.id === id);
    if (!existing) return;

    const safePayload = {
      name: payload.name ?? existing.name,
      ordering: payload.ordering ?? existing.ordering,
    };

    setBusyId(id);

    try {
      const updated =
        await updateAdminAttributeDefinition(
          id,
          safePayload
        );

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? updated : item
        )
      );

      showToast("Attribute updated", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Update failed",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: number) => {
    if (busyId !== null) return;

    const confirmed = confirm(
      "Delete this attribute?\n\nThis cannot be undone."
    );
    if (!confirmed) return;

    setBusyId(id);

    try {
      await deleteAdminAttributeDefinition(id);

      setItems((prev) =>
        prev.filter((item) => item.id !== id)
      );

      showToast("Attribute deleted", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Delete failed",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  /* ================= RENDER ================= */

  return (
    <section className="admin-attributes-page">
      {/* ================= HEADER ================= */}
      <header className="admin-page-header">
        <div>
          <h2>Product Attributes</h2>
          <p>
            Define reusable attribute keys for products
          </p>
        </div>

        <button
          className="btn primary"
          onClick={handleCreate}
        >
          + New Attribute
        </button>
      </header>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="admin-error-box">
          {error}
        </div>
      )}

      {/* ================= CONTENT ================= */}
      {loading ? (
        <div className="admin-loading">
          Loading attributes…
        </div>
      ) : (
        <AttributeTable
          items={items}
          savingId={busyId}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
