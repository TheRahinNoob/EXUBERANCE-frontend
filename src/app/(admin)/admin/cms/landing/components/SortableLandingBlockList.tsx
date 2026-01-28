"use client";

/**
 * ==================================================
 * SORTABLE LANDING BLOCK LIST
 * ==================================================
 *
 * Pure UI component:
 * - Drag & drop ordering
 * - Emits reordered list upward
 * - No persistence
 */

import { memo } from "react";
import "./sortable-landing-block-list.css";

/* ==================================================
   TYPES
================================================== */

export type SortableLandingBlock = {
  id: number;
  block_type: string;
  is_active: boolean;

  hot_category_block_id: number | null;
  comfort_rail_id: number | null;
};

/* ==================================================
   DND KIT
================================================== */

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ==================================================
   ROW
================================================== */

type RowProps = {
  block: SortableLandingBlock;
  onToggle: (block: SortableLandingBlock) => void;
  onDelete: (block: SortableLandingBlock) => void;
};

const SortableRow = memo(function SortableRow({
  block,
  onToggle,
  onDelete,
}: RowProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const linkedLabel =
    block.block_type === "hot"
      ? `Hot Block #${block.hot_category_block_id}`
      : block.block_type === "comfort_rail"
      ? `Comfort Rail #${block.comfort_rail_id}`
      : "—";

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`sortable-row ${
        block.is_active ? "active" : "inactive"
      }`}
    >
      {/* DRAG */}
      <td
        className="drag-cell"
        {...listeners}
        {...attributes}
        title="Drag to reorder"
      >
        ☰
      </td>

      {/* TYPE */}
      <td className="block-type">
        {block.block_type.replace("_", " ")}
      </td>

      {/* LINKED */}
      <td className="block-linked">
        {linkedLabel}
      </td>

      {/* ACTIVE */}
      <td className="block-toggle">
        <input
          type="checkbox"
          checked={block.is_active}
          onChange={() => onToggle(block)}
        />
      </td>

      {/* ACTION */}
      <td className="block-actions">
        <button
          className="ghost danger"
          onClick={() => onDelete(block)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
});

/* ==================================================
   LIST
================================================== */

type Props = {
  blocks: SortableLandingBlock[];
  onReorder: (blocks: SortableLandingBlock[]) => void;
  onToggleActive: (block: SortableLandingBlock) => void;
  onDelete: (block: SortableLandingBlock) => void;
};

export default function SortableLandingBlockList({
  blocks,
  onReorder,
  onToggleActive,
  onDelete,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(blocks, oldIndex, newIndex));
  }

  if (blocks.length === 0) {
    return (
      <p className="empty-state">
        No landing blocks configured.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map(b => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <table className="sortable-table">
          <thead>
            <tr>
              <th />
              <th>Type</th>
              <th>Linked Section</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {blocks.map(block => (
              <SortableRow
                key={block.id}
                block={block}
                onToggle={onToggleActive}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </SortableContext>
    </DndContext>
  );
}
