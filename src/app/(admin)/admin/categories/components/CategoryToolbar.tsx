"use client";

import { useMemo, useState } from "react";
import "./category-toolbar.css";

import { API_BASE, adminFetch } from "@/lib/admin-api";
import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   PROPS
================================================== */

type Props = {
  /** Reload category tree after creation */
  onCreated: () => void;
};

/* ==================================================
   UTILS
================================================== */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* ==================================================
   COMPONENT
================================================== */

export default function CategoryToolbar({ onCreated }: Props) {
  const { showToast } = useAdminToast();

  const [name, setName] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= DERIVED SLUG ================= */

  const computedSlug = useMemo(() => {
    const source = slugInput.trim() || name.trim();
    return source ? slugify(source) : "";
  }, [name, slugInput]);

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (saving) return;

    if (!name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    setSaving(true);

    try {
      const res = await adminFetch(
        `${API_BASE}/api/admin/categories/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            slug: computedSlug || undefined,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message ||
            data?.detail ||
            "Failed to create category"
        );
      }

      setName("");
      setSlugInput("");

      showToast("Category created", "success");
      onCreated();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Create failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <section className="category-toolbar">
      {/* NAME */}
      <div className="toolbar-field">
        <label>Category name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Men's Wear"
        />
      </div>

      {/* SLUG */}
      <div className="toolbar-field">
        <label>
          Slug <span>(optional)</span>
        </label>
        <input
          value={slugInput}
          onChange={(e) => setSlugInput(e.target.value)}
          placeholder="auto-generated if empty"
        />

        {computedSlug && (
          <div className="slug-preview">
            URL: <code>{computedSlug}</code>
          </div>
        )}
      </div>

      {/* ACTION */}
      <button
        className="toolbar-action"
        onClick={handleCreate}
        disabled={saving}
      >
        {saving ? "Creating…" : "Add Category"}
      </button>
    </section>
  );
}
