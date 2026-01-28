"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ProductGallery.module.css";
import { resolveMediaUrl } from "@/lib/media";

/* ==================================================
   TYPES
================================================== */
type ProductGalleryProps = {
  images: (string | null)[];
  name: string;
};

/* ==================================================
   COMPONENT
================================================== */
export default function ProductGallery({
  images,
  name,
}: ProductGalleryProps) {
  /* -----------------------------
     STABLE IMAGE NORMALIZATION
  ------------------------------ */
  const resolvedImages = useMemo(
    () =>
      images
        .filter(Boolean)
        .map((img) => resolveMediaUrl(img as string)),
    [images]
  );

  const [active, setActive] = useState<string | null>(null);

  /* -----------------------------
     INIT ACTIVE IMAGE (ONCE PER CHANGE)
  ------------------------------ */
  useEffect(() => {
    if (resolvedImages.length > 0) {
      setActive(resolvedImages[0]);
    }
  }, [resolvedImages]);

  /* -----------------------------
     EMPTY STATE
  ------------------------------ */
  if (!active) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.placeholder}>
          Image unavailable
        </div>
      </div>
    );
  }

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <section className={styles.wrapper}>
      {/* MAIN IMAGE */}
      <div className={styles.mainWrapper}>
        <img
          src={active}
          alt={name}
          className={styles.main}
          loading="eager"
        />
      </div>

      {/* THUMBNAILS */}
      {resolvedImages.length > 1 && (
        <div className={styles.thumbs} role="list">
          {resolvedImages.map((img, index) => {
            const isActive = img === active;

            return (
              <button
                key={img}
                type="button"
                onClick={() => setActive(img)}
                className={`${styles.thumb} ${
                  isActive ? styles.active : ""
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={isActive}
              >
                <img
                  src={img}
                  alt={`${name} thumbnail ${index + 1}`}
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
