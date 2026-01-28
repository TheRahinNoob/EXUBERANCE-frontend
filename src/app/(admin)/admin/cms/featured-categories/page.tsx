"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./featured-categories.css";

import {
  fetchAdminFeaturedCategories,
  type AdminFeaturedCategory,
} from "@/lib/admin-api/cms/featured-categories";

import { useAdminToast } from "@/hooks/useAdminToast";

import FeaturedCategoryToolbar from "./components/FeaturedCategoryToolbar";
import FeaturedCategoryGrid from "./components/FeaturedCategoryGrid";

/* ==================================================
   ADMIN — FEATURED CATEGORIES
================================================== */

export default function AdminFeaturedCategoriesPage() {
  const { showToast } = useAdminToast();

  const [items, setItems] = useState<AdminFeaturedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ================= LOAD ================= */

  const loadItems = useCallback(async () => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminFeaturedCategories();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load featured categories";

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadItems();
    return () => abortRef.current?.abort();
  }, [loadItems]);

  /* ================= UI ================= */

  return (
    <section className="featured-page">
      {/* HEADER */}
      <header className="featured-header">
        <div>
          <h1>Featured Categories</h1>
          <p>
            Curate image-based categories shown on the landing page
          </p>
        </div>
      </header>

      {/* TOOLBAR */}
      <FeaturedCategoryToolbar onCreated={loadItems} />

      {/* CONTENT */}
      <div className="featured-content">
        {loading && (
          <div className="featured-loading">
            Loading featured categories…
          </div>
        )}

        {!loading && error && (
          <div className="featured-error">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="featured-empty">
            No featured categories yet.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <FeaturedCategoryGrid
            items={items}
            onRefresh={loadItems}
          />
        )}
      </div>
    </section>
  );
}
