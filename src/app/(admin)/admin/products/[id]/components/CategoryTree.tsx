"use client";

import type { AdminCategoryTreeNode } from "@/lib/admin-api/types";
import CategoryNode from "./CategoryNode";
import "./category-tree.css";

export type CategoryTreeProps = {
  nodes: AdminCategoryTreeNode[];
  selected: Set<number>;
  onToggle: (id: number) => void;
};

export default function CategoryTree({
  nodes,
  selected,
  onToggle,
}: CategoryTreeProps) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return (
      <div className="category-tree-empty">
        No categories available.
      </div>
    );
  }

  return (
    <div
      role="tree"
      aria-label="Category tree"
      className="category-tree"
    >
      {nodes.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          selected={selected}
          onToggle={onToggle}
          depth={0}
        />
      ))}
    </div>
  );
}
