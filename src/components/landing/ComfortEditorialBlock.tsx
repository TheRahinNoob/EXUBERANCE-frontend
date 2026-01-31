"use client";

import Link from "next/link";
import styles from "./ComfortEditorialBlock.module.css";

/* ==================================================
   TYPES
================================================== */

export type ComfortEditorialBlockData = {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  cta_text: string | null;
  cta_url: string | null;
};

/* ==================================================
   COMPONENT
================================================== */

export default function ComfortEditorialBlock({
  block,
}: {
  block: ComfortEditorialBlockData;
}) {
  // Absolute CMS safety
  if (!block || !block.title) return null;

  const hasCTA = Boolean(block.cta_text && block.cta_url);
  const hasImage = Boolean(block.image);

  return (
    <section
      className={styles.section}
      aria-labelledby={`comfort-editorial-title-${block.id}`}
    >
      {/* FULL-WIDTH CONTAINER */}
      <div className={styles.container}>
        {/* ================= LEFT: CONTENT ================= */}
        <div className={styles.content}>
          {/* BRAND ROW */}
          <div className={styles.brandRow}>
            <span className={styles.brand}>EXUBERANCE</span>
            <span className={styles.brandArrow}>›</span>
          </div>

          {/* TEXT */}
          <header className={styles.textBlock}>
            <h2
              id={`comfort-editorial-title-${block.id}`}
              className={styles.title}
            >
              {block.title}
            </h2>

            {block.subtitle && (
              <p className={styles.subtitle}>
                {block.subtitle}
              </p>
            )}
          </header>

          {/* CTA */}
          {hasCTA && (
            <div className={styles.ctaWrap}>
              <Link
                href={block.cta_url!}
                className={styles.cta}
              >
                {block.cta_text}
              </Link>
            </div>
          )}
        </div>

        {/* ================= RIGHT: IMAGE ================= */}
        {hasImage && (
          <div className={styles.media}>
            <div className={styles.imageFrame}>
              <img
                src={block.image!}
                alt={block.title}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
