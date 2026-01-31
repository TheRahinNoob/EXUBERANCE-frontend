"use client";

/**
 * ==================================================
 * ADMIN CMS — COMFORT RAILS (PRODUCTION)
 * ==================================================
 * - Image required on create
 * - Category-anchored editorial rails
 * - Defensive updates
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

  /* ================= LOAD ================= */

  async function load() {
    try {
      setLoading(true);
      const [railsData, categoriesData] = await Promise.all([
        fetchAdminComfortRails(),
        fetchAdminCategories(),
      ]);

      setRails(Array.isArray(railsData) ? railsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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

  /* ================= CREATE ================= */

  async function handleCreate(categoryId: number, image: File) {
    await createAdminComfortRail({
      category_id: categoryId,
      image,
    });
    showToast("Comfort rail created", "success");
    load();
  }

  /* ================= UPDATE ================= */

  async function handleUpdate(
    id: number,
    payload: {
      auto_fill?: boolean;
      auto_limit?: number;
      is_active?: boolean;
    }
  ) {
    await updateAdminComfortRail(id, payload);
    showToast("Rail updated", "success");
    load();
  }

  /* ================= DELETE ================= */

  async function handleDelete(id: number) {
    if (!confirm("Delete this comfort rail permanently?")) return;
    await deleteAdminComfortRail(id);
    showToast("Rail deleted", "success");
    load();
  }

  /* ================= RENDER ================= */

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
  onCreate: (categoryId: number, image: File) => Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* Preview lifecycle */
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const canSubmit =
    !!categoryId && !!image && !submitting && categories.length > 0;

  return (
    <div className="comfort-rail-create">
      <select
        value={categoryId}
        onChange={(e) =>
          setCategoryId(e.target.value ? Number(e.target.value) : "")
        }
        disabled={categories.length === 0}
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

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="image-preview"
        />
      )}

      <button
        className="btn primary"
        disabled={!canSubmit}
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
        {submitting ? "Creating…" : "Create Comfort Rail"}
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
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [limit, setLimit] = useState(rail.auto_limit);
  const [busy, setBusy] = useState(false);

  return (
    <div className="comfort-rail-card" aria-busy={busy}>
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
          disabled={busy}
          onChange={async (e) => {
            setBusy(true);
            await onUpdate(rail.id, {
              auto_fill: e.target.checked,
            });
            setBusy(false);
          }}
        />
        Auto-fill products
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={rail.is_active}
          disabled={busy}
          onChange={async (e) => {
            setBusy(true);
            await onUpdate(rail.id, {
              is_active: e.target.checked,
            });
            setBusy(false);
          }}
        />
        Active
      </label>

      <div className="limit-row">
        <span>Limit</span>
        <input
          type="number"
          min={1}
          value={limit}
          disabled={busy || !rail.auto_fill}
          onChange={(e) =>
            setLimit(Math.max(1, Number(e.target.value)))
          }
          onBlur={async () => {
            if (limit !== rail.auto_limit) {
              setBusy(true);
              await onUpdate(rail.id, {
                auto_limit: limit,
              });
              setBusy(false);
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
        disabled={busy}
        onClick={() => onDelete(rail.id)}
      >
        Delete Rail
      </button>
    </div>
  );
}
