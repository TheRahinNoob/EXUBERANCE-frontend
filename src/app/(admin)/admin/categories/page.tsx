"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./categories-page.css";

import { fetchAdminCategoryTree } from "@/lib/admin-api/categories";
import type { AdminCategoryTreeNode } from "@/lib/admin-api/types";
import { useAdminToast } from "@/hooks/useAdminToast";

import CategoryTree from "./components/CategoryTree";
import CategoryToolbar from "./components/CategoryToolbar";

/* ==================================================
   ADMIN CATEGORIES PAGE
================================================== */

export default function AdminCategoriesPage() {
  const { showToast } = useAdminToast();

  const [tree, setTree] =
    useState<AdminCategoryTreeNode[]>([]);
  const [loading, setLoading] =
    useState<boolean>(true);
  const [error, setError] =
    useState<string | null>(null);

  const abortRef =
    useRef<AbortController | null>(null);

  /* ================= LOAD TREE ================= */

  const loadTree = useCallback(async () => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminCategoryTree();

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid category tree response"
        );
      }

      setTree(data);
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load categories";

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /* ================= INIT ================= */

  useEffect(() => {
    loadTree();
    return () => abortRef.current?.abort();
  }, [loadTree]);

  /* ================= RENDER ================= */

  return (
    <div className="admin-page">
      <div className="admin-surface categories-surface">
        {/* HEADER */}
        <div className="categories-header">
          <h1>Categories</h1>
          <p>
            Manage category hierarchy, campaigns,
            and visibility
          </p>
        </div>

        {/* TOOLBAR */}
        <CategoryToolbar onCreated={loadTree} />

        {/* CONTENT */}
        <div className="categories-content">
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

          {!loading &&
            !error &&
            tree.length === 0 && (
              <div className="categories-empty">
                No categories found.
              </div>
            )}

          {!loading &&
            !error &&
            tree.length > 0 && (
              <CategoryTree
                nodes={tree}
                onRefresh={loadTree}
              />
            )}
        </div>
      </div>
    </div>
  );
}
