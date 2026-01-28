"use client";

/**
 * ==================================================
 * ADMIN CMS — COMFORT RAILS
 * ==================================================
 * Image required on create
 * Category-anchored editorial rails
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import "./comfort-rails.css";

import { useAdminToast } from "@/hooks/useAdminToast";

import {
  fetchAdminComfortRails,
  createAdminComfortRail,
  updateAdminComfortRail,
  deleteAdminComfortRail,
  type AdminComfortCategoryRail,
} from "@/lib/admin-api/cms/comfort-rails";

import {
  fetchAdminCategories,
  type AdminCategory,
} from "@/lib/admin-api/categories";

/* ==================================================
   PAGE
================================================== */

export default function AdminComfortRailsPage() {
  const { showToast } = useAdminToast();

  const [rails, setRails] = useState<AdminComfortCategoryRail[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const [railsData, categoriesData] = await Promise.all([
        fetchAdminComfortRails(),
        fetchAdminCategories(),
      ]);
      setRails(railsData);
      setCategories(categoriesData);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to load comfort rails",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(categoryId: number, image: File) {
    try {
      await createAdminComfortRail({ category_id: categoryId, image });
      showToast("Comfort rail created", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Create failed",
        "error"
      );
    }
  }

  async function handleUpdate(
    id: number,
    payload: {
      auto_fill?: boolean;
      auto_limit?: number;
      is_active?: boolean;
    }
  ) {
    try {
      await updateAdminComfortRail(id, payload);
      showToast("Rail updated", "success");
      load();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Update failed",
        "error"
      );
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this comfort rail permanently?")) return;

    try {
      await deleteAdminComfortRail(id);
      showToast("Rail deleted", "success");
      load();
    } catch {
      showToast("Delete failed", "error");
    }
  }

  return (
    <section className="comfort-rails-page">
      <header className="comfort-rails-header">
        <h1>Comfort Rails</h1>
        <p>Category-anchored editorial rails (image required)</p>
      </header>

      <CreateComfortRailForm
        categories={categories}
        onCreate={handleCreate}
      />

      {loading ? (
        <p className="muted">Loading…</p>
      ) : rails.length === 0 ? (
        <p className="muted italic">No comfort rails created yet.</p>
      ) : (
        <div className="rails-grid">
          {rails.map((rail) => (
            <ComfortRailCard
              key={rail.id}
              rail={rail}
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
   CREATE FORM
================================================== */

function CreateComfortRailForm({
  categories,
  onCreate,
}: {
  categories: AdminCategory[];
  onCreate: (categoryId: number, image: File) => void;
}) {
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="comfort-rail-create">
      <select
        value={categoryId}
        onChange={(e) =>
          setCategoryId(e.target.value ? Number(e.target.value) : "")
        }
      >
        <option value="">Select category…</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setImage(e.target.files?.[0] ?? null)
        }
      />

      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="Preview"
          className="image-preview"
        />
      )}

      <button
        className="btn primary"
        disabled={!categoryId || !image || submitting}
        onClick={async () => {
          if (!categoryId || !image) return;
          try {
            setSubmitting(true);
            await onCreate(categoryId, image);
            setCategoryId("");
            setImage(null);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        Create Comfort Rail
      </button>
    </div>
  );
}

/* ==================================================
   CARD
================================================== */

function ComfortRailCard({
  rail,
  onUpdate,
  onDelete,
}: {
  rail: AdminComfortCategoryRail;
  onUpdate: (
    id: number,
    payload: {
      auto_fill?: boolean;
      auto_limit?: number;
      is_active?: boolean;
    }
  ) => void;
  onDelete: (id: number) => void;
}) {
  const [limit, setLimit] = useState(rail.auto_limit);

  return (
    <div className="comfort-rail-card">
      {rail.image && (
        <img
          src={rail.image}
          alt={rail.category.name}
          className="rail-image"
        />
      )}

      <h3>{rail.category.name}</h3>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={rail.auto_fill}
          onChange={(e) =>
            onUpdate(rail.id, { auto_fill: e.target.checked })
          }
        />
        Auto-fill products
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={rail.is_active}
          onChange={(e) =>
            onUpdate(rail.id, { is_active: e.target.checked })
          }
        />
        Active
      </label>

      <div className="limit-row">
        <span>Limit</span>
        <input
          type="number"
          min={1}
          value={limit}
          onChange={(e) =>
            setLimit(Math.max(1, Number(e.target.value)))
          }
          onBlur={() => {
            if (limit !== rail.auto_limit) {
              onUpdate(rail.id, { auto_limit: limit });
            }
          }}
        />
      </div>

      <Link
        href={`/admin/cms/comfort-rails/${rail.id}`}
        className="manage-link"
      >
        Manage Products →
      </Link>

      <button
        className="danger"
        onClick={() => onDelete(rail.id)}
      >
        Delete Rail
      </button>
    </div>
  );
}
