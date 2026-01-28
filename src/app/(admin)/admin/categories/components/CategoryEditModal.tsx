"use client";

import { useEffect, useMemo, useState } from "react";
import "./category-edit-modal.css";

import { API_BASE, DEFAULT_FETCH_OPTIONS } from "@/lib/admin-api";
import { getCSRFToken } from "@/lib/admin-api/csrf";
import type { AdminCategoryTreeNode } from "@/lib/admin-api/types";
import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   TYPES
================================================== */

type CategoryPayload = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  is_active: boolean;

  is_campaign: boolean;
  starts_at: string | null;
  ends_at: string | null;
  show_countdown: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  category: CategoryPayload;
  tree: AdminCategoryTreeNode[];
};

/* ==================================================
   HELPERS
================================================== */

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function flattenTreeSafe(
  nodes: AdminCategoryTreeNode[],
  excludeId: number,
  depth = 0,
  blocked = new Set<number>(),
  acc: { id: number; label: string }[] = []
) {
  for (const node of nodes) {
    if (blocked.has(node.id)) continue;

    acc.push({
      id: node.id,
      label: `${"— ".repeat(depth)}${node.name}`,
    });

    if (node.id === excludeId) {
      markDescendants(node, blocked);
      continue;
    }

    flattenTreeSafe(
      node.children,
      excludeId,
      depth + 1,
      blocked,
      acc
    );
  }
  return acc;
}

function markDescendants(
  node: AdminCategoryTreeNode,
  blocked: Set<number>
) {
  for (const child of node.children) {
    blocked.add(child.id);
    markDescendants(child, blocked);
  }
}

/* ==================================================
   COMPONENT
================================================== */

export default function CategoryEditModal({
  open,
  onClose,
  onSaved,
  category,
  tree,
}: Props) {
  const { showToast } = useAdminToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [isCampaign, setIsCampaign] = useState(false);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  /* ================= INIT ================= */

  useEffect(() => {
    if (!open) return;

    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parent_id);
    setIsActive(category.is_active);

    setIsCampaign(category.is_campaign);
    setStartsAt(category.starts_at);
    setEndsAt(category.ends_at);
    setShowCountdown(category.show_countdown);

    setSlugTouched(false);
  }, [open, category]);

  /* ================= SLUG AUTO ================= */

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  /* ================= PARENT OPTIONS ================= */

  const parentOptions = useMemo(
    () => flattenTreeSafe(tree, category.id),
    [tree, category.id]
  );

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    if (
      isCampaign &&
      startsAt &&
      endsAt &&
      new Date(startsAt) >= new Date(endsAt)
    ) {
      showToast(
        "Campaign start time must be before end time",
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      const csrf = getCSRFToken();

      const res = await fetch(
        `${API_BASE}/api/admin/categories/${category.id}/`,
        {
          ...DEFAULT_FETCH_OPTIONS,
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(csrf ? { "X-CSRFToken": csrf } : {}),
          },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || undefined,
            parent_id: parentId,
            is_active: isActive,
            is_campaign: isCampaign,
            starts_at: isCampaign ? startsAt : null,
            ends_at: isCampaign ? endsAt : null,
            show_countdown: isCampaign ? showCountdown : false,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.detail || data?.message || "Update failed"
        );
      }

      showToast("Category updated", "success");
      onSaved();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Update failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  /* ================= UI ================= */

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <header className="admin-modal-header">
          <h3>Edit Category</h3>
        </header>

        <div className="admin-modal-body">
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Slug</label>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label>Parent</label>
            <select
              value={parentId ?? ""}
              onChange={(e) =>
                setParentId(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">— Root —</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>

          <div className="divider" />

          <label className="checkbox">
            <input
              type="checkbox"
              checked={isCampaign}
              onChange={(e) => setIsCampaign(e.target.checked)}
            />
            Campaign category
          </label>

          {isCampaign && (
            <div className="campaign-box">
              <div className="form-group">
                <label>Starts at</label>
                <input
                  type="datetime-local"
                  value={startsAt ?? ""}
                  onChange={(e) => setStartsAt(e.target.value || null)}
                />
              </div>

              <div className="form-group">
                <label>Ends at</label>
                <input
                  type="datetime-local"
                  value={endsAt ?? ""}
                  onChange={(e) => setEndsAt(e.target.value || null)}
                />
              </div>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={showCountdown}
                  onChange={(e) => setShowCountdown(e.target.checked)}
                />
                Show countdown
              </label>
            </div>
          )}
        </div>

        <footer className="admin-modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}
