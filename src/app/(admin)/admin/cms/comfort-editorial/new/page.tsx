"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createAdminComfortEditorialBlock,
} from "@/lib/admin-api";

import styles from "./ComfortEditorialCreate.module.css";

/* ==================================================
   PAGE — CREATE COMFORT EDITORIAL
================================================== */

export default function AdminComfortEditorialCreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [isActive, setIsActive] = useState(true);
  const [ordering, setOrdering] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (saving) return;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!image) {
      setError("Image is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createAdminComfortEditorialBlock({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        cta_text: ctaText.trim() || null,
        cta_url: ctaUrl.trim() || null,
        image,
        is_active: isActive,
        ordering,
      });

      router.push("/admin/cms/comfort-editorial");
    } catch (err: any) {
      setError(
        err?.message || "Failed to create editorial block"
      );
    } finally {
      setSaving(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <section className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            New Comfort Editorial
          </h1>
          <p className={styles.subtitle}>
            Create a new editorial block for the landing page
          </p>
        </div>
      </header>

      {/* FORM */}
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {/* TITLE */}
        <div className={styles.field}>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
            autoComplete="off"
            inputMode="text"
          />
        </div>

        {/* SUBTITLE */}
        <div className={styles.field}>
          <label htmlFor="subtitle">Subtitle</label>
          <textarea
            id="subtitle"
            rows={2}
            value={subtitle}
            onChange={(e) =>
              setSubtitle(e.target.value)
            }
          />
        </div>

        {/* IMAGE */}
        <div className={styles.field}>
          <label htmlFor="image">Image *</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            required
            onChange={(e) =>
              setImage(
                e.target.files?.[0] || null
              )
            }
          />
          <p className={styles.hint}>
            Square image recommended
          </p>
        </div>

        {/* CTA TEXT */}
        <div className={styles.field}>
          <label htmlFor="ctaText">CTA Text</label>
          <input
            id="ctaText"
            value={ctaText}
            onChange={(e) =>
              setCtaText(e.target.value)
            }
            placeholder="Shop Now"
            autoComplete="off"
          />
        </div>

        {/* CTA URL */}
        <div className={styles.field}>
          <label htmlFor="ctaUrl">CTA URL</label>
          <input
            id="ctaUrl"
            type="url"
            value={ctaUrl}
            onChange={(e) =>
              setCtaUrl(e.target.value)
            }
            placeholder="https://example.com"
            inputMode="url"
          />
        </div>

        {/* ORDER + ACTIVE */}
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="ordering">
              Ordering
            </label>
            <input
              id="ordering"
              type="number"
              value={ordering}
              inputMode="numeric"
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
            className={styles.primaryBtn}
            disabled={saving}
          >
            {saving ? "Saving…" : "Create"}
          </button>

          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() =>
              router.push(
                "/admin/cms/comfort-editorial"
              )
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
