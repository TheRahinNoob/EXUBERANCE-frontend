"use client";

import { useState } from "react";
import { useAdminToast } from "@/hooks/useAdminToast";
import ImagePicker from "./ImagePicker";

import { createAdminComfortRail } from "@/lib/admin-api/cms/comfort-rails";
import type { AdminCategory } from "@/lib/admin-api/categories";

import "./create-comfort-rail.css";

/* ==================================================
   PROPS
================================================== */

type Props = {
  categories: AdminCategory[];
  onCreated: () => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function CreateComfortRail({
  categories,
  onCreated,
}: Props) {
  const { showToast } = useAdminToast();

  const [categoryId, setCategoryId] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ==================================================
     CREATE
  ================================================== */

  async function handleCreate() {
    if (!categoryId) {
      showToast("Category is required", "error");
      return;
    }

    if (!image) {
      showToast("Image is required", "error");
      return;
    }

    try {
      setSubmitting(true);

      await createAdminComfortRail({
        category_id: categoryId,
        image,
      });

      showToast("Comfort rail created", "success");

      setCategoryId("");
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

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="create-comfort-rail">
      {/* CATEGORY */}
      <select
        value={categoryId}
        disabled={submitting}
        onChange={(e) =>
          setCategoryId(
            e.target.value ? Number(e.target.value) : ""
          )
        }
      >
        <option value="">Select category…</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* IMAGE */}
      <ImagePicker value={image} onChange={setImage} />

      {/* ACTION */}
      <button
        className="btn primary"
        onClick={handleCreate}
        disabled={submitting}
      >
        {submitting ? "Creating…" : "Create Comfort Rail"}
      </button>
    </div>
  );
}
