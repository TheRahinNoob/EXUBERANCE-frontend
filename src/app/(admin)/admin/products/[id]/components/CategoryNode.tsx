"use client";

import { useState } from "react";
import type { AdminCategoryTreeNode } from "@/lib/admin-api/types";

/* ==================================================
   PROPS — STRICT CONTRACT
================================================== */

type Props = {
  node: AdminCategoryTreeNode;
  selected: Set<number>;
  onToggle: (id: number) => void;
  depth: number;
};

/* ==================================================
   COMPONENT — CATEGORY NODE
================================================== */

export default function CategoryNode({
  node,
  selected,
  onToggle,
  depth,
}: Props) {
  const children = Array.isArray(node.children)
    ? node.children
    : [];

  const hasChildren = children.length > 0;
  const isChecked = selected.has(node.id);

  const [expanded, setExpanded] = useState(false);

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={isChecked}
    >
      <div
        className={[
          "category-row",
          `depth-${depth}`,
          hasChildren ? "has-children" : "",
          isChecked ? "selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* EXPAND / COLLAPSE */}
        {hasChildren ? (
          <button
            type="button"
            className="category-toggle"
            aria-label={
              expanded
                ? "Collapse category"
                : "Expand category"
            }
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? "−" : "+"}
          </button>
        ) : (
          <span
            className="category-toggle-spacer"
            aria-hidden
          />
        )}

        {/* CHECKBOX */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(node.id)}
          aria-label={`Select category ${node.name}`}
        />

        {/* LABEL */}
        <span className="category-label">
          {node.name}
        </span>
      </div>

      {/* CHILDREN */}
      {hasChildren && expanded && (
        <div role="group" className="category-children">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              selected={selected}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
