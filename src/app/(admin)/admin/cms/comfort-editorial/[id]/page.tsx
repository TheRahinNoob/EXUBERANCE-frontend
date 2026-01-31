"use client";

/**
 * ==================================================
 * ADMIN CMS — EDIT COMFORT EDITORIAL
 * ==================================================
 */

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  fetchAdminComfortEditorialBlock,
  updateAdminComfortEditorialBlock,
  deleteAdminComfortEditorialBlock,
} from "@/lib/admin-api";

import { useAdminToast } from "@/hooks/useAdminToast";
import styles from "./ComfortEditorialEdit.module.css";

/* ==================================================
   PAGE
================================================== */

export default function AdminComfortEditorialEditPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const params = useParams();

  const id = Number(params?.id);
  const abortRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ordering, setOrdering] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const [image, setImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Invalid editorial ID");
      setLoading(false);
      return;
    }

    abortRef.current = false;

    async function load() {
      try {
        const block =
          await fetchAdminComfortEditorialBlock(id);

        if (abortRef.current) return;

        setTitle(block.title);
        setSubtitle(block.subtitle || "");
        setCtaText(block.cta_text || "");
        setCtaUrl(block.cta_url || "");
        setOrdering(block.ordering);
        setIsActive(block.is_active);
        setImage(block.image);
      } catch (err: any) {
        if (abortRef.current) return;

        setError(
          err?.message || "Failed to load editorial block"
        );
      } finally {
        if (!abortRef.current) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      abortRef.current = true;
    };
  }, [id]);

  /* ================= SAVE ================= */

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateAdminComfortEditorialBlock(id, {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        cta_text: ctaText.trim() || null,
        cta_url: ctaUrl.trim() || null,
        ordering,
        is_active: isActive,
        ...(newImage ? { image: newImage } : {}),
      });

      showToast("Changes saved", "success");
      router.refresh();
    } catch (err: any) {
      setError(
        err?.message || "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  }

  /* ================= DELETE ================= */

  async function handleDelete() {
    if (
      !confirm(
        "Delete this comfort editorial block?\n\nThis action cannot be undone."
      )
    )
      return;

    try {
      await deleteAdminComfortEditorialBlock(id);
      showToast("Editorial deleted", "success");
      router.push("/admin/cms/comfort-editorial");
    } catch (err: any) {
      showToast(
        err?.message || "Delete failed",
        "error"
      );
    }
  }

  /* ================= RENDER ================= */

  if (loading) {
    return <p className={styles.muted}>Loading…</p>;
  }

  return (
    <section className={styles.page}>
      {/* ================= HEADER ================= */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Edit Comfort Editorial
          </h1>
          <p className={styles.subtitle}>
            Update landing page editorial content
          </p>
        </div>

        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
        >
          Delete
        </button>
      </header>

      {/* ================= FORM ================= */}
      <form
        className={styles.form}
        onSubmit={handleSave}
      >
        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {/* TITLE */}
        <div className={styles.field}>
          <label>Title *</label>
          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />
        </div>

        {/* SUBTITLE */}
        <div className={styles.field}>
          <label>Subtitle</label>
          <textarea
            rows={2}
            value={subtitle}
            onChange={(e) =>
              setSubtitle(e.target.value)
            }
          />
        </div>

        {/* CURRENT IMAGE */}
        {image && (
          <div className={styles.field}>
            <label>Current Image</label>
            <img
              src={image}
              alt=""
              className={styles.preview}
            />
          </div>
        )}

        {/* REPLACE IMAGE */}
        <div className={styles.field}>
          <label>Replace Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewImage(
                e.target.files?.[0] || null
              )
            }
          />
        </div>

        {/* CTA */}
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>CTA Text</label>
            <input
              value={ctaText}
              onChange={(e) =>
                setCtaText(e.target.value)
              }
            />
          </div>

          <div className={styles.field}>
            <label>CTA URL</label>
            <input
              type="url"
              value={ctaUrl}
              onChange={(e) =>
                setCtaUrl(e.target.value)
              }
            />
          </div>
        </div>

        {/* META */}
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Ordering</label>
            <input
              type="number"
              value={ordering}
              onChange={(e) =>
                setOrdering(
                  Number(e.target.value) || 0
                )
              }
            />
          </div>

          <div className={styles.checkbox}>
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(e.target.checked)
                }
              />
              Active
            </label>
          </div>
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            className={styles.backBtn}
            onClick={() =>
              router.push(
                "/admin/cms/comfort-editorial"
              )
            }
          >
            Back
          </button>
        </div>
      </form>
    </section>
  );
}
