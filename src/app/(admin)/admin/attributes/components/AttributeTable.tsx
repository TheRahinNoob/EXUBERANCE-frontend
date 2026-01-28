"use client";

import { useEffect, useState } from "react";
import "./attribute-table.css";

import AdminTable from "@/app/(admin)/admin/components/AdminTable";
import type {
  AdminProductAttributeDefinition,
} from "@/lib/admin-api/product-attributes";

/* ==================================================
   PROPS
================================================== */

type Props = {
  items: AdminProductAttributeDefinition[];
  savingId: number | null;
  onUpdate: (
    id: number,
    payload: { name?: string; ordering?: number }
  ) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
};

/* ==================================================
   COMPONENT
================================================== */

export default function AttributeTable({
  items,
  savingId,
  onUpdate,
  onDelete,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="attribute-empty">
        No attributes created yet.
      </div>
    );
  }

  return (
    <AdminTable className="attribute-table">
      <thead>
        <tr>
          <th>Name</th>
          <th style={{ width: 110 }}>Order</th>
          <th align="right" style={{ width: 220 }}>
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {items.map((attr) => (
          <AttributeRow
            key={attr.id}
            item={attr}
            saving={savingId === attr.id}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </AdminTable>
  );
}

/* ==================================================
   ROW (INLINE EDITABLE)
================================================== */

function AttributeRow({
  item,
  saving,
  onUpdate,
  onDelete,
}: {
  item: AdminProductAttributeDefinition;
  saving: boolean;
  onUpdate: (
    id: number,
    payload: { name?: string; ordering?: number }
  ) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
}) {
  const [name, setName] = useState(item.name);
  const [ordering, setOrdering] = useState(item.ordering);

  /* 🔒 Sync local state with backend */
  useEffect(() => {
    setName(item.name);
    setOrdering(item.ordering);
  }, [item.name, item.ordering]);

  const isDirty =
    name.trim() !== item.name ||
    ordering !== item.ordering;

  const handleSave = () => {
    if (!name.trim()) return;

    onUpdate(item.id, {
      name: name.trim(),
      ordering,
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        `Delete attribute "${item.name}"?\n\nThis cannot be undone.`
      )
    )
      return;

    onDelete(item.id);
  };

  return (
    <tr className={saving ? "is-saving" : ""}>
      <td>
        <input
          className="attribute-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
        />
      </td>

      <td>
        <input
          className="attribute-order"
          type="number"
          value={ordering}
          onChange={(e) =>
            setOrdering(Number(e.target.value) || 0)
          }
          disabled={saving}
        />
      </td>

      <td align="right">
        <div className="attribute-actions">
          <button
            className="btn glass"
            disabled={!isDirty || saving}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            className="btn danger"
            disabled={saving}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
