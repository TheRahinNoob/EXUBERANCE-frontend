"use client";

import type { AdminHeroBanner } from "@/lib/admin-api/cms/hero-banners";

type Props = {
  desktop: File | null;
  tablet: File | null;
  mobile: File | null;
  existing?: AdminHeroBanner;
};

/**
 * Normalize nullable backend strings into
 * browser-safe preview URLs.
 */
function resolvePreview(
  file: File | null,
  existingUrl?: string | null
): string | undefined {
  if (file) {
    return URL.createObjectURL(file);
  }

  if (typeof existingUrl === "string") {
    return existingUrl;
  }

  return undefined;
}

export default function HeroBannerPreview({
  desktop,
  tablet,
  mobile,
  existing,
}: Props) {
  const desktopSrc = resolvePreview(
    desktop,
    existing?.image_desktop
  );
  const tabletSrc = resolvePreview(
    tablet,
    existing?.image_tablet
  );
  const mobileSrc = resolvePreview(
    mobile,
    existing?.image_mobile
  );

  if (!desktopSrc && !tabletSrc && !mobileSrc) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 16,
        display: "flex",
        gap: 12,
      }}
    >
      {desktopSrc && (
        <img
          src={desktopSrc}
          alt="Desktop preview"
          style={{
            height: 60,
            borderRadius: 6,
            border: "1px solid #e5e7eb",
          }}
        />
      )}

      {tabletSrc && (
        <img
          src={tabletSrc}
          alt="Tablet preview"
          style={{
            height: 60,
            borderRadius: 6,
            border: "1px solid #e5e7eb",
          }}
        />
      )}

      {mobileSrc && (
        <img
          src={mobileSrc}
          alt="Mobile preview"
          style={{
            height: 60,
            borderRadius: 6,
            border: "1px solid #e5e7eb",
          }}
        />
      )}
    </div>
  );
}
