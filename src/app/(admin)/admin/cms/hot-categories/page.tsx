"use client";

/* ==================================================
   HOT CATEGORIES — ADMIN PAGE
================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import "./hot-categories.css";

import {
  fetchAdminHotCategories,
  createAdminHotCategory,
  updateAdminHotCategory,
  deleteAdminHotCategory,
  type AdminHotCategory,
} from "@/lib/admin-api/cms/hot-categories";

import { fetchAdminCategories } from "@/lib/admin-api/categories";
import type { AdminCategory } from "@/lib/admin-api/types";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   PAGE
================================================== */

export default function AdminHotCategoriesPage() {
  const { showToast } = useAdminToast();

  const [items, setItems] = useState<AdminHotCategory[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);

  /* ================= LOAD ================= */

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);

      const [hot, cats] = await Promise.all([
        fetchAdminHotCategories(),
        fetchAdminCategories(),
      ]);

      setItems(hot);
      setCategories(cats.filter((c) => c.is_active));
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to load hot categories",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  /* ================= CREATE ================= */

  async function handleCreate(
    categoryId: number,
    image: File
  ) {
    try {
      await createAdminHotCategory({
        category_id: categoryId,
        image,
      });

      showToast("Hot category created", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Create failed",
        "error"
      );
    }
  }

  /* ================= UPDATE ================= */

  async function handleUpdate(
    id: number,
    payload: {
      is_active?: boolean;
      ordering?: number;
      image?: File;
    }
  ) {
    try {
      await updateAdminHotCategory(id, payload);
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Update failed",
        "error"
      );
    }
  }

  /* ================= DELETE ================= */

  async function handleDelete(id: number) {
    if (!confirm("Delete this hot category?")) return;

    try {
      await deleteAdminHotCategory(id);
      showToast("Hot category deleted", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Delete failed",
        "error"
      );
    }
  }

  /* ================= RENDER ================= */

  return (
    <section className="hot-page">
      {/* HEADER */}
      <header className="hot-header">
        <h1>Hot Categories</h1>
        <p>
          Manage atomic hot categories used across landing
          layouts
        </p>
      </header>

      {/* CREATE */}
      <CreateHotCategory
        categories={categories}
        onCreate={handleCreate}
      />

      {/* LIST */}
      {loading ? (
        <p className="hot-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="hot-muted italic">
          No hot categories created yet.
        </p>
      ) : (
        <div className="hot-grid">
          {items.map((item) => (
            <HotCategoryCard
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ==================================================
   CREATE TOOLBAR
================================================== */

function CreateHotCategory({
  categories,
  onCreate,
}: {
  categories: AdminCategory[];
  onCreate: (categoryId: number, image: File) => void;
}) {
  const [categoryId, setCategoryId] =
    useState<number | "">("");
  const [image, setImage] = useState<File | null>(
    null
  );

  return (
    <div className="hot-toolbar">
      <div className="hot-field">
        <label>Category</label>
        <select
          value={categoryId}
          onChange={(e) =>
            setCategoryId(
              e.target.value
                ? Number(e.target.value)
                : ""
            )
          }
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="hot-field">
        <label>Image</label>
        <label className="file-input">
          {image ? image.name : "Choose image"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>

      <button
        className="btn primary"
        onClick={() => {
          if (
            typeof categoryId === "number" &&
            image
          ) {
            onCreate(categoryId, image);
            setCategoryId("");
            setImage(null);
          }
        }}
      >
        Add Hot Category
      </button>
    </div>
  );
}

/* ==================================================
   CARD
================================================== */

function HotCategoryCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: AdminHotCategory;
  onUpdate: (
    id: number,
    payload: {
      is_active?: boolean;
      ordering?: number;
      image?: File;
    }
  ) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="hot-card">
      {item.image && (
        <img
          src={item.image}
          alt={item.category.name}
        />
      )}

      <h3>{item.category.name}</h3>
      <p className="slug">/{item.category.slug}</p>

      <div className="hot-controls">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={item.is_active}
            onChange={(e) =>
              onUpdate(item.id, {
                is_active: e.target.checked,
              })
            }
          />
          Active
        </label>

        <input
          type="number"
          value={item.ordering}
          onChange={(e) =>
            onUpdate(item.id, {
              ordering: Number(e.target.value),
            })
          }
        />
      </div>

      <label className="file-input small">
        Replace image
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpdate(item.id, { image: file });
            }
          }}
        />
      </label>

      <button
        className="danger"
        onClick={() => onDelete(item.id)}
      >
        Delete
      </button>
    </div>
  );
}
