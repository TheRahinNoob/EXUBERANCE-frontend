"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const resolvedImages = useMemo(
    () =>
      images
        .filter(Boolean)
        .map((img) => resolveMediaUrl(img as string)),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (resolvedImages.length > 0) {
      setActiveIndex(0);
    }
  }, [resolvedImages]);

  if (!resolvedImages.length) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.placeholder}>Image unavailable</div>
      </div>
    );
  }

  const active = resolvedImages[activeIndex];
  const hasMultiple = resolvedImages.length > 1;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < resolvedImages.length - 1;

  function goTo(index: number) {
    if (index < 0 || index >= resolvedImages.length) return;
    setActiveIndex(index);
  }

  function goPrev() {
    if (!canGoPrev) return;
    setActiveIndex((prev) => prev - 1);
  }

  function goNext() {
    if (!canGoNext) return;
    setActiveIndex((prev) => prev + 1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (!hasMultiple) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
    touchEndX.current = null;
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    touchEndX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd() {
    if (
      touchStartX.current === null ||
      touchEndX.current === null ||
      !hasMultiple
    ) {
      return;
    }

    const deltaX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 40;

    if (deltaX > swipeThreshold) {
      goNext();
    } else if (deltaX < -swipeThreshold) {
      goPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  return (
    <section
      className={styles.wrapper}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`${name} image gallery`}
    >
      <div
        className={styles.mainWrapper}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.mainImageShell}>
          <img
            src={active}
            alt={name}
            className={styles.main}
            loading="eager"
          />

          {hasMultiple && canGoPrev && (
            <button
              type="button"
              onClick={goPrev}
              className={`${styles.navBtn} ${styles.navBtnLeft}`}
              aria-label="Previous image"
            >
              <i className="fa fa-angle-left" />
            </button>
          )}

          {hasMultiple && canGoNext && (
            <button
              type="button"
              onClick={goNext}
              className={`${styles.navBtn} ${styles.navBtnRight}`}
              aria-label="Next image"
            >
              <i className="fa fa-angle-right" />
            </button>
          )}

          {hasMultiple && (
            <>
              <div className={styles.counter}>
                {activeIndex + 1} / {resolvedImages.length}
              </div>

              <div className={styles.progressRail} aria-hidden="true">
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${((activeIndex + 1) / resolvedImages.length) * 100}%`,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {hasMultiple && (
        <div className={styles.thumbs} role="list" aria-label="Product images">
          {resolvedImages.map((img, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => goTo(index)}
                className={`${styles.thumb} ${isActive ? styles.active : ""}`}
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