"use client";

import { useEffect, useState } from "react";
import "./admin-product-attributes.css";

import AdminTable from "../../../components/AdminTable";
import { useAdminToast } from "@/hooks/useAdminToast";
import AddProductAttributeForm from "./AddProductAttributeForm";

import {
  fetchAdminProductAttributes,
  updateAdminProductAttribute,
  deleteAdminProductAttribute,
  reorderAdminProductAttributes,
  type AdminProductAttributeValue,
} from "@/lib/admin-api/product-attributes";

/* ================= DND ================= */

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/* ==================================================
   PROPS
================================================== */

type Props = {
  productId: number;
};

/* ==================================================
   COMPONENT
================================================== */

export default function AdminProductAttributeManager({
  productId,
}: Props) {
  const { showToast } = useAdminToast();

  const [items, setItems] =
    useState<AdminProductAttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ================= DND SENSORS ================= */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /* ================= LOAD ================= */

  const loadAttributes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminProductAttributes(productId);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load attributes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, [productId]);

  /* ================= UPDATE ================= */

  const handleUpdate = async (id: number, value: string) => {
    if (savingId !== null) return;

    setSavingId(id);

    try {
      await updateAdminProductAttribute(id, { value });
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, value } : i
        )
      );
      showToast("Attribute updated", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Update failed",
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this attribute?")) return;

    setSavingId(id);

    try {
      await deleteAdminProductAttribute(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Attribute removed", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Delete failed",
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  /* ================= REORDER ================= */

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    try {
      await reorderAdminProductAttributes(
        productId,
        reordered.map((i) => i.id)
      );
      showToast("Attributes reordered", "success");
    } catch {
      await loadAttributes();
      showToast("Reorder failed", "error");
    }
  };

  /* ================= RENDER ================= */

  return (
    <section className="admin-section">
      <div className="admin-section-title">
        Product Attributes
      </div>

      <AddProductAttributeForm
        productId={productId}
        usedAttributeIds={items.map((i) => i.attribute_id)}
        onAdded={loadAttributes}
      />

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-muted">Loading attributes…</div>}

      {!loading && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <AdminTable>
              <thead>
                <tr>
                  <th className="drag-col"></th>
                  <th>Attribute</th>
                  <th>Value</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <SortableAttributeRow
                    key={item.id}
                    item={item}
                    saving={savingId === item.id}
                    onSave={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </AdminTable>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

/* ==================================================
   SORTABLE ROW
================================================== */

function SortableAttributeRow({
  item,
  saving,
  onSave,
  onDelete,
}: {
  item: AdminProductAttributeValue;
  saving: boolean;
  onSave: (id: number, value: string) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [value, setValue] = useState(item.value);
  const isDirty = value !== item.value;

  return (
    <tr ref={setNodeRef} style={style}>
      <td
        {...attributes}
        {...listeners}
        className="admin-drag-handle"
      >
        ⠿
      </td>

      <td>{item.attribute_name}</td>

      <td>
        <input
          className="admin-input-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </td>

      <td className="admin-actions">
        <button
          className="admin-action admin-action-primary"
          disabled={!isDirty || saving}
          onClick={() => onSave(item.id, value)}
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <button
          className="admin-action admin-action-danger"
          disabled={saving}
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
