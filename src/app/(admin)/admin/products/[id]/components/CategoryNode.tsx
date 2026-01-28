"use client";

import { useState } from "react";
import type { AdminCategoryTreeNode } from "@/lib/admin-api/types";

type Props = {
  node: AdminCategoryTreeNode;
  selected: Set<number>;
  onToggle: (id: number) => void;
  depth: number;
};

export default function CategoryNode({
  node,
  selected,
  onToggle,
  depth,
}: Props) {
  const hasChildren = node.children.length > 0;
  const isChecked = selected.has(node.id);
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
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
        {/* TOGGLE */}
        {hasChildren ? (
          <button
            type="button"
            className="category-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-label={
              expanded ? "Collapse category" : "Expand category"
            }
          >
            {expanded ? "−" : "+"}
          </button>
        ) : (
          <span className="category-toggle-spacer" />
        )}

        {/* CHECKBOX */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(node.id)}
        />

        {/* LABEL */}
        <span className="category-label">{node.name}</span>
      </div>

      {hasChildren && expanded && (
        <div className="category-children">
          {node.children.map((child) => (
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
