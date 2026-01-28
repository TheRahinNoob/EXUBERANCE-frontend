"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./landing-menu-item-form.css";

import {
  createAdminLandingMenuItem,
  updateAdminLandingMenuItem,
  deleteAdminLandingMenuItem,
  fetchAdminCategoryTree,
} from "@/lib/admin-api";

import type {
  AdminLandingMenuItem,
  AdminLandingMenuItemCreatePayload,
  AdminLandingMenuItemUpdatePayload,
  AdminCategoryTreeNode,
} from "@/lib/admin-api";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   TYPES
================================================== */

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  existing?: AdminLandingMenuItem;
};

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
};

/* ==================================================
   HELPERS
================================================== */

function flattenCategories(
  nodes: AdminCategoryTreeNode[],
  acc: CategoryOption[] = []
): CategoryOption[] {
  for (const node of nodes) {
    acc.push({
      id: node.id,
      name: node.name,
      slug: node.slug,
      is_active: node.is_active,
    });

    if (node.children?.length) {
      flattenCategories(node.children, acc);
    }
  }
  return acc;
}

/* ==================================================
   COMPONENT
================================================== */

export default function LandingMenuItemForm({
  mode,
  existing,
}: Props) {
  const router = useRouter();
  const { showToast } = useAdminToast();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [categoryId, setCategoryId] = useState<number | "">(
    existing?.category.id ?? ""
  );

  const [seoTitle, setSeoTitle] = useState(existing?.seo_title ?? "");
  const [seoDescription, setSeoDescription] =
    useState(existing?.seo_description ?? "");

  const [isActive, setIsActive] = useState(
    existing?.is_active ?? true
  );
  const [ordering, setOrdering] = useState(
    existing?.ordering ?? 0
  );

  const [submitting, setSubmitting] = useState(false);

  /* ================= LOAD CATEGORIES ================= */

  useEffect(() => {
    if (mode === "edit") {
      setLoadingCategories(false);
      return;
    }

    (async () => {
      try {
        const tree = await fetchAdminCategoryTree();
        setCategories(flattenCategories(tree));
      } catch (err) {
        showToast("Failed to load categories", "error");
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, [mode, showToast]);

  /* ================= VALIDATION ================= */

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (mode === "create" && !categoryId) return false;
    return true;
  }, [mode, categoryId, submitting]);

  /* ================= SUBMIT ================= */

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      try {
        setSubmitting(true);

        if (mode === "create") {
          const payload: AdminLandingMenuItemCreatePayload = {
            category_id: Number(categoryId),
            is_active: isActive,
            ordering,
            seo_title: seoTitle || undefined,
            seo_description: seoDescription || undefined,
          };

          await createAdminLandingMenuItem(payload);
          showToast("Landing menu item created", "success");
        } else {
          if (!existing) throw new Error("Missing item");

          const payload: AdminLandingMenuItemUpdatePayload = {
            is_active: isActive,
            ordering,
            seo_title: seoTitle,
            seo_description: seoDescription,
          };

          await updateAdminLandingMenuItem(existing.id, payload);
          showToast("Landing menu item updated", "success");
        }

        router.push("/admin/cms/landing-menu-items");
      } catch (err) {
        showToast("Save failed", "error");
      } finally {
        setSubmitting(false);
      }
    },
    [
      canSubmit,
      mode,
      existing,
      categoryId,
      isActive,
      ordering,
      seoTitle,
      seoDescription,
      router,
      showToast,
    ]
  );

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!existing) return;

    if (!confirm("Delete this menu item permanently?")) return;

    try {
      setSubmitting(true);
      await deleteAdminLandingMenuItem(existing.id);
      showToast("Deleted", "success");
      router.push("/admin/cms/landing-menu-items");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {/* CATEGORY */}
      <fieldset className="admin-fieldset">
        <legend>Category</legend>

        {mode === "create" ? (
          loadingCategories ? (
            <p className="muted">Loading categories…</p>
          ) : (
            <div className="form-group">
              <label>Category</label>
              <select
                className="admin-select"
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              >
                <option value="">— Select category —</option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={!cat.is_active}
                  >
                    {cat.name}
                    {!cat.is_active ? " (inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )
        ) : (
          <div className="static-value">
            <strong>{existing?.category.name}</strong>
            <span>{existing?.category.slug}</span>
          </div>
        )}
      </fieldset>

      {/* VISIBILITY */}
      <fieldset className="admin-fieldset">
        <legend>Visibility & Order</legend>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) =>
              setIsActive(e.target.checked)
            }
          />
          Active
        </label>

        <div className="form-group">
          <label>Ordering</label>
          <input
            type="number"
            value={ordering}
            onChange={(e) =>
              setOrdering(Number(e.target.value))
            }
          />
        </div>
      </fieldset>

      {/* SEO */}
      <fieldset className="admin-fieldset">
        <legend>SEO (Optional)</legend>

        <div className="form-group">
          <label>SEO Title</label>
          <input
            value={seoTitle}
            onChange={(e) =>
              setSeoTitle(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>SEO Description</label>
          <input
            value={seoDescription}
            onChange={(e) =>
              setSeoDescription(e.target.value)
            }
          />
        </div>
      </fieldset>

      {/* ACTIONS */}
      <div className="admin-actions">
        <button
          type="submit"
          className="btn primary"
          disabled={!canSubmit}
        >
          {mode === "create"
            ? "Create Menu Item"
            : "Save Changes"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            className="btn danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
