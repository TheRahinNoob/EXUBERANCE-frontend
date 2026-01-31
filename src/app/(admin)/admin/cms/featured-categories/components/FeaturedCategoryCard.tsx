"use client";

import { useRef, useState } from "react";
import "./featured-category-card.css";

import {
  deleteAdminFeaturedCategory,
  updateAdminFeaturedCategory,
} from "@/lib/admin-api/cms/featured-categories";

import type {
  AdminFeaturedCategory,
} from "@/lib/admin-api/cms/featured-categories";

import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   PROPS
================================================== */

type Props = {
  item: AdminFeaturedCategory;
  onRefresh: () => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function FeaturedCategoryCard({
  item,
  onRefresh,
}: Props) {
  const { showToast } = useAdminToast();
  const [busy, setBusy] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ================= TOGGLE ACTIVE ================= */

  async function toggleActive() {
    if (busy) return;

    try {
      setBusy(true);

      await updateAdminFeaturedCategory(item.id, {
        is_active: !item.is_active,
      });

      onRefresh();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Update failed",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  /* ================= IMAGE REPLACE ================= */

  async function replaceImage(file: File) {
    if (busy) return;

    try {
      setBusy(true);

      await updateAdminFeaturedCategory(item.id, {
        image: file,
      });

      showToast("Image updated", "success");
      onRefresh();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Image update failed",
        "error"
      );
    } finally {
      setBusy(false);

      // 🔒 Allow re-selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  /* ================= DELETE ================= */

  async function remove() {
    if (busy) return;

    const confirmed = confirm(
      "Remove this featured category?\n\nThis cannot be undone."
    );
    if (!confirmed) return;

    try {
      setBusy(true);

      await deleteAdminFeaturedCategory(item.id);

      showToast(
        "Featured category removed",
        "success"
      );
      onRefresh();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Delete failed",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <article
      className={`featured-card ${
        !item.is_active ? "is-inactive" : ""
      }`}
      aria-busy={busy}
      aria-disabled={busy}
    >
      {/* ================= IMAGE ================= */}
      {item.image ? (
        <div className="featured-card-image">
          <img
            src={item.image}
            alt={item.category.name}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="featured-card-image placeholder">
          No image
        </div>
      )}

      {/* ================= META ================= */}
      <div className="featured-card-body">
        <h3 className="featured-card-title">
          {item.category.name}
        </h3>

        <p className="featured-card-slug">
          /{item.category.slug}
        </p>

        {/* ================= FILE ================= */}
        <label
          className="file-replace"
          aria-disabled={busy}
        >
          Replace image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) replaceImage(file);
            }}
          />
        </label>

        {/* ================= ACTIONS ================= */}
        <div className="featured-card-actions">
          <button
            className="btn"
            onClick={toggleActive}
            disabled={busy}
          >
            {item.is_active ? "Disable" : "Enable"}
          </button>

          <button
            className="btn danger"
            onClick={remove}
            disabled={busy}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
