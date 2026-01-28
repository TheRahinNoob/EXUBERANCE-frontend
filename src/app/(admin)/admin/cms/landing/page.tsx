"use client";

/**
 * ==================================================
 * ADMIN CMS — LANDING PAGE COMPOSITION
 * ==================================================
 */

import { useCallback, useEffect, useRef, useState } from "react";

import "./landing-composer.css";

import {
  fetchAdminLandingBlocks,
  updateAdminLandingBlock,
  deleteAdminLandingBlock,
} from "@/lib/admin-api/cms/landing-blocks";

import type { AdminLandingBlock } from "@/lib/admin-api/cms/landing-blocks";
import { useAdminToast } from "@/hooks/useAdminToast";

import CreateLandingBlockModal from "./CreateLandingBlockModal";

/* ================= DND ================= */

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ==================================================
   SORTABLE ROW
================================================== */

function SortableRow({
  block,
  onToggleActive,
  onDelete,
}: {
  block: AdminLandingBlock;
  onToggleActive: (block: AdminLandingBlock) => void;
  onDelete: (block: AdminLandingBlock) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="landing-row">
      <td className="drag-handle" {...listeners} {...attributes}>
        ☰
      </td>

      <td className="block-type">
        {block.block_type}
      </td>

      <td className="block-linked">
        {block.block_type === "hot" &&
          `Hot Block #${block.hot_category_block_id}`}
        {block.block_type === "comfort_rail" &&
          `Comfort Rail #${block.comfort_rail_id}`}
        {block.block_type !== "hot" &&
          block.block_type !== "comfort_rail" &&
          "—"}
      </td>

      <td>
        <input
          type="checkbox"
          checked={block.is_active}
          onChange={() => onToggleActive(block)}
        />
      </td>

      <td>
        <button
          className="btn danger ghost"
          onClick={() => onDelete(block)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

/* ==================================================
   PAGE
================================================== */

export default function AdminLandingCMSPage() {
  const { showToast } = useAdminToast();

  const [blocks, setBlocks] = useState<AdminLandingBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  /* ================= LOAD ================= */

  const loadBlocks = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      setLoading(true);
      const data = await fetchAdminLandingBlocks();
      setBlocks(data);
      setDirty(false);
    } catch {
      showToast("Failed to load landing blocks", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadBlocks();
    return () => abortRef.current?.abort();
  }, [loadBlocks]);

  /* ================= DND ================= */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      setDirty(true);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  /* ================= SAVE ================= */

  async function handleSaveOrder() {
    try {
      for (let i = 0; i < blocks.length; i++) {
        await updateAdminLandingBlock(blocks[i].id, {
          ordering: i,
        });
      }
      showToast("Order saved", "success");
      loadBlocks();
    } catch {
      showToast("Save failed", "error");
      loadBlocks();
    }
  }

  /* ================= ACTIONS ================= */

  async function toggleActive(block: AdminLandingBlock) {
    await updateAdminLandingBlock(block.id, {
      is_active: !block.is_active,
    });
    loadBlocks();
  }

  async function remove(block: AdminLandingBlock) {
    if (!confirm("Delete this block permanently?")) return;
    await deleteAdminLandingBlock(block.id);
    loadBlocks();
  }

  /* ================= RENDER ================= */

  if (loading) {
    return <p className="muted">Loading landing blocks…</p>;
  }

  return (
    <section className="landing-composer">
      <header className="composer-header">
        <div>
          <h1>Landing Page</h1>
          <p className="muted">
            Drag & drop to reorder landing sections
          </p>
        </div>

        <div className="composer-actions">
          <button
            className="btn accent"
            onClick={() => setCreateOpen(true)}
          >
            + Add Block
          </button>

          {dirty && (
            <button
              className="btn success"
              onClick={handleSaveOrder}
            >
              Save order
            </button>
          )}
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <table className="landing-table">
            <thead>
              <tr>
                <th />
                <th>Type</th>
                <th>Linked</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {blocks.map((block) => (
                <SortableRow
                  key={block.id}
                  block={block}
                  onToggleActive={toggleActive}
                  onDelete={remove}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      <CreateLandingBlockModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadBlocks}
      />
    </section>
  );
}
