"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  API_BASE,
  DEFAULT_FETCH_OPTIONS,
  parseErrorResponse,
} from "@/lib/admin-api";
import { fetchAdminCategoryTree } from "@/lib/admin-api/categories";
import { getCSRFToken } from "@/lib/admin-api/csrf";

import type { AdminCategoryTreeNode } from "@/lib/admin-api/types";
import { useAdminToast } from "@/hooks/useAdminToast";

import CategoryTree from "./CategoryTree";

/* ==================================================
   PROPS — STRICT CONTRACT
================================================== */

type Props = {
  productId: number;
  initialCategoryIds?: number[];
};

/* ==================================================
   COMPONENT — PRODUCT CATEGORY MANAGER
================================================== */

export default function ProductCategoryManager({
  productId,
  initialCategoryIds = [],
}: Props) {
  const { showToast } = useAdminToast();

  /* ================= STATE ================= */

  const [tree, setTree] = useState<AdminCategoryTreeNode[]>([]);

  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(initialCategoryIds)
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const mountedRef = useRef(true);

  /* ================= SYNC FROM PARENT ================= */

  useEffect(() => {
    setSelected(new Set(initialCategoryIds));
  }, [initialCategoryIds]);

  /* ================= DIRTY CHECK ================= */

  const isDirty = useMemo(() => {
    const a = Array.from(selected).sort();
    const b = [...initialCategoryIds].sort();

    if (a.length !== b.length) return true;

    return a.some((id, i) => id !== b[i]);
  }, [selected, initialCategoryIds]);

  /* ================= LOAD CATEGORY TREE ================= */

  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      try {
        const data = await fetchAdminCategoryTree();

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid category tree response"
          );
        }

        if (mountedRef.current) {
          setTree(data);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load categories"
          );
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ================= TOGGLE CATEGORY (LOCAL) ================= */

  const toggleCategory = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /* ================= SAVE TO BACKEND ================= */

  const handleSave = async () => {
    if (saving || !isDirty) return;

    setSaving(true);

    try {
      const csrfToken = getCSRFToken();

      if (!csrfToken) {
        throw new Error(
          "CSRF token missing. Please reload."
        );
      }

      const res = await fetch(
        `${API_BASE}/api/admin/products/${productId}/`,
        {
          ...DEFAULT_FETCH_OPTIONS,
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            category_ids: Array.from(selected),
          }),
        }
      );

      if (!res.ok) {
        throw new Error(await parseErrorResponse(res));
      }

      showToast("Categories updated", "success");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to update categories",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="admin-section">
      <div className="admin-section-title">
        Categories
      </div>

      {loading && (
        <div className="admin-table-state">
          Loading categories…
        </div>
      )}

      {!loading && error && (
        <div className="admin-table-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <CategoryTree
            nodes={tree}
            selected={selected}
            onToggle={toggleCategory}
          />

          <div className="admin-actions-bar">
            <button
              className="admin-action admin-action-primary"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving
                ? "Saving…"
                : isDirty
                ? "Save Categories"
                : "No changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
