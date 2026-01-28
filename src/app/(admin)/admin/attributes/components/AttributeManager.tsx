"use client";

import { useEffect, useState } from "react";
import "./attribute-manager.css";

import { useAdminToast } from "@/hooks/useAdminToast";

import {
  fetchAdminAttributeDefinitions,
  createAdminAttributeDefinition,
  updateAdminAttributeDefinition,
  deleteAdminAttributeDefinition,
  type AdminProductAttributeDefinition,
} from "@/lib/admin-api/product-attributes";

import AddAttributeForm from "./AddAttributeForm";
import AttributeTable from "./AttributeTable";

/* ==================================================
   COMPONENT — ATTRIBUTE MANAGER
================================================== */

export default function AttributeManager() {
  const { showToast } = useAdminToast();

  const [items, setItems] = useState<
    AdminProductAttributeDefinition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ==================================================
     LOAD (BACKEND = SOURCE OF TRUTH)
  ================================================== */

  const loadAttributes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminAttributeDefinitions();

      if (!Array.isArray(data)) {
        throw new Error("Invalid attribute response");
      }

      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load attributes"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  /* ==================================================
     CREATE
  ================================================== */

  const handleCreate = async (
    name: string,
    ordering: number
  ) => {
    try {
      const created =
        await createAdminAttributeDefinition({
          name,
          ordering,
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

  /* ==================================================
     UPDATE
  ================================================== */

  const handleUpdate = async (
    id: number,
    payload: { name?: string; ordering?: number }
  ) => {
    if (savingId !== null) return;

    setSavingId(id);

    try {
      const updated =
        await updateAdminAttributeDefinition(
          id,
          payload
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
      setSavingId(null);
    }
  };

  /* ==================================================
     DELETE
  ================================================== */

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure?\n\nThis attribute must not be used by any product."
      )
    )
      return;

    setSavingId(id);

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
      setSavingId(null);
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <section className="attribute-manager">
      {/* ================= HEADER ================= */}
      <header className="attribute-header">
        <div>
          <h2>Product Attributes</h2>
          <p>
            Define reusable product specifications like
            Fabric, GSM, Fit, etc.
          </p>
        </div>
      </header>

      {/* ================= ADD FORM ================= */}
      <AddAttributeForm onCreate={handleCreate} />

      {/* ================= ERROR ================= */}
      {error && (
        <div className="attribute-error">
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="attribute-loading">
          Loading attributes…
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!loading && (
        <AttributeTable
          items={items}
          savingId={savingId}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
