"use client";

import Link from "next/link";
import styles from "./HeroBanner.module.css";

/* ==================================================
   TYPES — CMS-SAFE API CONTRACT
================================================== */
export type HeroBannerItem = {
  id: number;
  image_desktop: string | null;
  image_tablet: string | null;
  image_mobile: string | null;
};

/* ==================================================
   FALLBACKS (CENTRALIZED, EDITABLE)
================================================== */
const FALLBACK_DESKTOP = "/placeholders/hero-desktop.jpg";
const FALLBACK_TABLET = "/placeholders/hero-tablet.jpg";
const FALLBACK_MOBILE = "/placeholders/hero-mobile.jpg";

/* ==================================================
   HERO BANNER
   - PURE RENDER COMPONENT
   - CMS SAFE
   - NULL-TOLERANT
================================================== */
export default function HeroBanner({
  banners,
}: {
  banners: HeroBannerItem[];
}) {
  if (!Array.isArray(banners) || banners.length === 0) {
    return null;
  }

  // Backend already sorted by priority
  const banner = banners[0];

  const desktopSrc =
    banner.image_desktop ?? FALLBACK_DESKTOP;

  const tabletSrc =
    banner.image_tablet ??
    banner.image_desktop ??
    FALLBACK_TABLET;

  const mobileSrc =
    banner.image_mobile ??
    banner.image_tablet ??
    banner.image_desktop ??
    FALLBACK_MOBILE;

  return (
    <section
      className={styles.hero}
      aria-label="Fabrilife featured banner"
    >
      <Link
        href="/shop"
        aria-label="Go to shop"
        prefetch
      >
        <picture>
          {/* Desktop */}
          <source
            media="(min-width: 1024px)"
            srcSet={desktopSrc}
          />

          {/* Tablet */}
          <source
            media="(min-width: 640px)"
            srcSet={tabletSrc}
          />

          {/* Mobile fallback */}
          <img
            src={mobileSrc}
            alt="Fabrilife featured banner"
            className={styles.image}
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
        </picture>
      </Link>
    </section>
  );
}
