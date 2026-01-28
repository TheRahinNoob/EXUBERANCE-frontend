"use client";

import { memo } from "react";
import type { AdminCategoryTreeNode } from "@/lib/admin-api/types";
import CategoryNode from "./CategoryNode";
import "./category-tree.css";

/* ==================================================
   PROPS — ADMIN CATEGORY TREE
================================================== */

export type CategoryTreeProps = {
  /** Root category nodes (backend-built hierarchy) */
  nodes: AdminCategoryTreeNode[];

  /** Reload from backend after any mutation */
  onRefresh: () => void;
};

/* ==================================================
   COMPONENT
================================================== */

function CategoryTree({ nodes, onRefresh }: CategoryTreeProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="category-tree-empty">
        No categories available.
      </div>
    );
  }

  return (
    <section
      role="tree"
      aria-label="Category hierarchy"
      className="category-tree"
    >
      {nodes.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          depth={0}
          tree={nodes}
          onRefresh={onRefresh}
        />
      ))}
    </section>
  );
}

/* ==================================================
   EXPORT
================================================== */

export default memo(CategoryTree);
