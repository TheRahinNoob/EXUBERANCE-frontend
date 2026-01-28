"use client";

import { useEffect, useMemo, useState } from "react";
import "./category-form-modal.css";

import { API_BASE, DEFAULT_FETCH_OPTIONS } from "@/lib/admin-api";
import { getCSRFToken } from "@/lib/admin-api/csrf";
import type { AdminCategory } from "@/lib/admin-api/types";
import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   PROPS
================================================== */

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;

  category?: AdminCategory | null;
  allCategories: AdminCategory[];
};

/* ==================================================
   COMPONENT
================================================== */

export default function CategoryFormModal({
  open,
  onClose,
  onSuccess,
  category,
  allCategories,
}: Props) {
  const { showToast } = useAdminToast();
  const isEditMode = Boolean(category);

  /* ================= FORM STATE ================= */

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);

  const [isActive, setIsActive] = useState(true);
  const [ordering, setOrdering] = useState(0);
  const [priority, setPriority] = useState(0);

  const [isCampaign, setIsCampaign] = useState(false);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= SYNC EDIT ================= */

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setParentId(category.parent_id ?? null);
      setIsActive(category.is_active);
      setOrdering(category.ordering);
      setPriority(category.priority);

      setIsCampaign((category as any).is_campaign ?? false);
      setStartsAt((category as any).starts_at ?? null);
      setEndsAt((category as any).ends_at ?? null);
      setShowCountdown((category as any).show_countdown ?? false);
    } else {
      setName("");
      setSlug("");
      setParentId(null);
      setIsActive(true);
      setOrdering(0);
      setPriority(0);
      setIsCampaign(false);
      setStartsAt(null);
      setEndsAt(null);
      setShowCountdown(false);
    }
  }, [category, open]);

  /* ================= PARENT OPTIONS ================= */

  const parentOptions = useMemo(
    () =>
      allCategories.filter(
        (c) => !category || c.id !== category.id
      ),
    [allCategories, category]
  );

  /* ================= VALIDATION ================= */

  function validate(): string | null {
    if (!name.trim()) return "Category name is required.";
    if (!slug.trim()) return "Slug is required.";

    if (isCampaign) {
      if (!startsAt || !endsAt)
        return "Campaign requires start and end time.";
      if (new Date(startsAt) >= new Date(endsAt))
        return "Campaign start must be before end.";
    }

    return null;
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const csrf = getCSRFToken();

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        parent_id: parentId,
        is_active: isActive,
        ordering,
        priority,
        is_campaign: isCampaign,
        starts_at: isCampaign ? startsAt : null,
        ends_at: isCampaign ? endsAt : null,
        show_countdown: isCampaign ? showCountdown : false,
      };

      const res = await fetch(
        isEditMode
          ? `${API_BASE}/api/admin/categories/${category!.id}/`
          : `${API_BASE}/api/admin/categories/`,
        {
          ...DEFAULT_FETCH_OPTIONS,
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(csrf ? { "X-CSRFToken": csrf } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Save failed");
      }

      showToast(
        isEditMode ? "Category updated" : "Category created",
        "success"
      );

      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  /* ================= RENDER ================= */

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <header className="admin-modal-header">
          <h3>{isEditMode ? "Edit Category" : "New Category"}</h3>
        </header>

        {error && <div className="admin-modal-error">{error}</div>}

        <div className="admin-modal-body">
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Parent</label>
            <select
              value={parentId ?? ""}
              onChange={(e) =>
                setParentId(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">— No parent —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Ends at</label>
                <input
                  type="datetime-local"
                  value={endsAt ?? ""}
                  onChange={(e) => setEndsAt(e.target.value)}
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

          <div className="divider" />

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Ordering</label>
              <input
                type="number"
                value={ordering}
                onChange={(e) => setOrdering(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <footer className="admin-modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}
