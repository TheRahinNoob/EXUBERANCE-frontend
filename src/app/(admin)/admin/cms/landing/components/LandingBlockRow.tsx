"use client";

/**
 * ==================================================
 * LANDING BLOCK ROW
 * ==================================================
 *
 * Fully controlled, presentational row component.
 */

import { memo } from "react";
import "./landing-block-row.css";

/* ==================================================
   TYPES
================================================== */

export type LandingBlockRowData = {
  id: number;
  block_type: string;
  is_active: boolean;

  hot_category_block_id: number | null;
  comfort_rail_id: number | null;
};

type Props = {
  block: LandingBlockRowData;
  onToggleActive: (block: LandingBlockRowData) => void;
  onDelete: (block: LandingBlockRowData) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLTableCellElement>;
};

/* ==================================================
   COMPONENT
================================================== */

const LandingBlockRow = memo(function LandingBlockRow({
  block,
  onToggleActive,
  onDelete,
  dragHandleProps,
}: Props) {
  const linkedLabel = (() => {
    switch (block.block_type) {
      case "hot":
        return `Hot Block #${block.hot_category_block_id}`;
      case "comfort_rail":
        return `Comfort Rail #${block.comfort_rail_id}`;
      default:
        return "—";
    }
  })();

  return (
    <tr
      className={`landing-block-row ${
        block.is_active ? "active" : "inactive"
      }`}
    >
      {/* DRAG HANDLE */}
      <td
        className="drag-cell"
        {...dragHandleProps}
        title={dragHandleProps ? "Drag to reorder" : undefined}
      >
        {dragHandleProps ? "☰" : null}
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
          onChange={() => onToggleActive(block)}
          aria-label="Toggle visibility"
        />
      </td>

      {/* ACTIONS */}
      <td className="block-actions">
        <button
          className="danger ghost"
          onClick={() => onDelete(block)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
});

export default LandingBlockRow;
