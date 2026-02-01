"use client";

import { memo, useMemo, useState } from "react";
import "./category-node.css";

import type { AdminCategoryTreeNode } from "@/lib/admin-api/types";
import {
  API_BASE,
  adminFetch,
} from "@/lib/admin-api";
import { useAdminToast } from "@/hooks/useAdminToast";

import CategoryEditModal from "./CategoryEditModal";

/* ==================================================
   PROPS
================================================== */

type CategoryNodeProps = {
  node: AdminCategoryTreeNode;
  depth: number;
  tree: AdminCategoryTreeNode[];
  onRefresh: () => void;
};

/* ==================================================
   COMPONENT
================================================== */

function CategoryNode({
  node,
  depth,
  tree,
  onRefresh,
}: CategoryNodeProps) {
  const { showToast } = useAdminToast();

  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const hasChildren = node.children.length > 0;
  const isInactive = node.is_active === false;

  const campaignLabel = useMemo(
    () => (node.is_campaign ? "Campaign" : null),
    [node.is_campaign]
  );

  /* ==================================================
     HELPERS — API PATCH (CSRF SAFE)
  ================================================== */

  const patchCategory = async (
    payload: Record<string, unknown>,
    successMsg: string
  ) => {
    setLoading(true);

    try {
      const res = await adminFetch(
        `${API_BASE}/api/admin/categories/${node.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.detail || data?.message || "Update failed"
        );
      }

      showToast(successMsg, "success");
      onRefresh();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Update failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     ACTIONS
  ================================================== */

  const toggleActive = () =>
    patchCategory(
      { is_active: !node.is_active },
      node.is_active
        ? "Category deactivated"
        : "Category activated"
    );

  const toggleCampaign = () =>
    patchCategory(
      { is_campaign: !node.is_campaign },
      node.is_campaign
        ? "Campaign removed"
        : "Marked as campaign"
    );

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete "${node.name}"?\n\nThis cannot be undone.`
      )
    )
      return;

    setLoading(true);

    try {
      const res = await adminFetch(
        `${API_BASE}/api/admin/categories/${node.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.detail || data?.message || "Delete failed"
        );
      }

      showToast("Category deleted", "success");
      onRefresh();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Delete failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="category-node-wrapper">
      <div
        role="treeitem"
        aria-expanded={expanded}
        className={[
          "category-node",
          `depth-${depth}`,
          isInactive ? "inactive" : "",
        ].join(" ")}
      >
        {/* EXPAND */}
        {hasChildren ? (
          <button
            className="category-expand"
            onClick={() => setExpanded(v => !v)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="category-expand-spacer" />
        )}

        {/* NAME */}
        <span className="category-name">
          {node.name}
        </span>

        {/* BADGES */}
        {campaignLabel && (
          <span className="category-badge campaign">
            {campaignLabel}
          </span>
        )}

        {isInactive && (
          <span className="category-badge inactive">
            Inactive
          </span>
        )}

        {/* ACTIONS */}
        <div className="category-actions">
          <button
            onClick={() => setEditing(true)}
            disabled={loading}
          >
            Edit
          </button>

          <button
            onClick={toggleCampaign}
            disabled={loading}
          >
            {node.is_campaign
              ? "Remove Campaign"
              : "Make Campaign"}
          </button>

          <button
            onClick={toggleActive}
            disabled={loading}
          >
            {node.is_active ? "Deactivate" : "Activate"}
          </button>

          <button
            className="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </button>
        </div>
      </div>

      {/* CHILDREN */}
      {expanded && hasChildren && (
        <div className="category-children">
          {node.children.map(child => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              tree={tree}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <CategoryEditModal
        open={editing}
        onClose={() => setEditing(false)}
        onSaved={onRefresh}
        category={{
          id: node.id,
          name: node.name,
          slug: node.slug,
          parent_id: node.parent_id,
          is_active: node.is_active,
          is_campaign: node.is_campaign,

          // REQUIRED FOR CategoryPayload
          starts_at: node.starts_at ?? null,
          ends_at: node.ends_at ?? null,
          show_countdown: node.show_countdown ?? false,
        }}
        tree={tree}
      />
    </div>
  );
}

export default memo(CategoryNode);
