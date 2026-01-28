"use client";

import { useEffect, useMemo, useState } from "react";
import "./featured-category-toolbar.css";

import {
  createAdminFeaturedCategory,
  fetchAdminFeaturedCategories,
} from "@/lib/admin-api/cms/featured-categories";

import { fetchAdminCategories } from "@/lib/admin-api/categories";

import type { AdminCategory } from "@/lib/admin-api/types";
import type {
  AdminFeaturedCategory,
} from "@/lib/admin-api/cms/featured-categories";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   PROPS
================================================== */

type Props = {
  onCreated: () => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function FeaturedCategoryToolbar({
  onCreated,
}: Props) {
  const { showToast } = useAdminToast();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [featured, setFeatured] = useState<AdminFeaturedCategory[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | "">("");

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [cats, feats] = await Promise.all([
          fetchAdminCategories(),
          fetchAdminFeaturedCategories(),
        ]);

        if (!alive) return;

        setCategories(cats);
        setFeatured(feats);
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "Failed to load data",
          "error"
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [showToast]);

  /* ================= FEATURED SET ================= */

  const featuredCategoryIds = useMemo(() => {
    return new Set(featured.map((f) => f.category.id));
  }, [featured]);

  /* ================= CREATE ================= */

  async function handleCreate() {
    if (!selectedCategoryId) {
      showToast("Select a category", "error");
      return;
    }

    if (!image) {
      showToast("Upload an image", "error");
      return;
    }

    try {
      setSubmitting(true);

      await createAdminFeaturedCategory({
        category_id: selectedCategoryId,
        image,
      });

      showToast("Featured category added", "success");

      setSelectedCategoryId("");
      setImage(null);
      onCreated();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Create failed",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="featured-toolbar">
      {/* CATEGORY */}
      <div className="toolbar-field">
        <label>Category</label>
        <select
          disabled={loading || submitting}
          value={selectedCategoryId}
          onChange={(e) =>
            setSelectedCategoryId(
              e.target.value ? Number(e.target.value) : ""
            )
          }
        >
          <option value="">
            {loading
              ? "Loading categories…"
              : "Select category"}
          </option>

          {categories.map((cat) => {
            const isFeatured =
              featuredCategoryIds.has(cat.id);

            return (
              <option
                key={cat.id}
                value={cat.id}
                disabled={!cat.is_active || isFeatured}
              >
                {cat.name}
                {!cat.is_active && " (inactive)"}
                {isFeatured && " (already featured)"}
              </option>
            );
          })}
        </select>
      </div>

      {/* IMAGE */}
      <div className="toolbar-field">
        <label>Image</label>
        <label className="file-input">
          {image ? image.name : "Choose image"}
          <input
            type="file"
            accept="image/*"
            disabled={submitting}
            onChange={(e) =>
              setImage(e.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>

      {/* ACTION */}
      <button
        className="btn primary"
        onClick={handleCreate}
        disabled={submitting}
      >
        {submitting ? "Adding…" : "Add Featured"}
      </button>
    </div>
  );
}
