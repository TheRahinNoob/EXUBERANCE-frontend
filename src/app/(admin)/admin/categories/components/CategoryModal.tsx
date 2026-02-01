"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createAdminCategory,
  updateAdminCategory,
} from "@/lib/admin-api/categories";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   TYPES
================================================== */

type Mode = "create" | "edit" | "create-child";

type CategoryPayload = {
  id?: number;
  name?: string;
  slug?: string;
  parent_id?: number | null;
};

/* ==================================================
   PROPS
================================================== */

type Props = {
  open: boolean;
  mode: Mode;

  /** Used for edit / create-child */
  category?: CategoryPayload;

  /** Called after successful mutation */
  onSuccess: () => void;

  /** Close modal */
  onClose: () => void;
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

export default function CategoryModal({
  open,
  mode,
  category,
  onSuccess,
  onClose,
}: Props) {
  const { showToast } = useAdminToast();

  /* ================= STATE ================= */

  const [name, setName] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [parentId, setParentId] = useState<number | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  /* ================= INIT FROM MODE ================= */

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && category) {
      setName(category.name ?? "");
      setSlugInput(category.slug ?? "");
      setParentId(category.parent_id ?? null);
      return;
    }

    if (mode === "create-child" && category) {
      setName("");
      setSlugInput("");
      setParentId(category.id ?? null);
      return;
    }

    // create
    setName("");
    setSlugInput("");
    setParentId(null);
  }, [open, mode, category]);

  /* ================= DERIVED SLUG ================= */

  const computedSlug = useMemo(() => {
    const source = slugInput || name;
    return source ? slugify(source) : "";
  }, [name, slugInput]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (saving) return;

    if (!name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        slug: computedSlug || undefined,
        parent_id: parentId,
      };

      if (mode === "edit" && category?.id) {
        await updateAdminCategory(category.id, payload);
        showToast("Category updated successfully", "success");
      } else {
        await createAdminCategory(payload);
        showToast("Category created successfully", "success");
      }

      onSuccess();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Category operation failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */

  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>
          {mode === "edit"
            ? "Edit Category"
            : mode === "create-child"
            ? "Create Sub-Category"
            : "Create Category"}
        </h3>

        {/* NAME */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* SLUG */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Slug</label>
          <input
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="auto-generated if empty"
            style={inputStyle}
          />
          {computedSlug && (
            <span style={slugPreviewStyle}>
              URL: <code>{computedSlug}</code>
            </span>
          )}
        </div>

        {/* PARENT */}
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Parent ID (optional)
          </label>
          <input
            type="number"
            value={parentId ?? ""}
            onChange={(e) =>
              setParentId(
                e.target.value
                  ? Number(e.target.value)
                  : null
              )
            }
            style={inputStyle}
          />
        </div>

        {/* ACTIONS */}
        <div style={actionsStyle}>
          <button onClick={onClose} style={secondaryBtn}>
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            style={primaryBtn}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================
   STYLES
================================================== */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalStyle: React.CSSProperties = {
  width: 420,
  background: "#ffffff",
  borderRadius: 10,
  padding: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginTop: 12,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 2,
};

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
};

const slugPreviewStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#6b7280",
  marginTop: 2,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 16,
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  background: "#111827",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  background: "#e5e7eb",
  border: "none",
  cursor: "pointer",
};
