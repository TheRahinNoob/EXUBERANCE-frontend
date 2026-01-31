"use client";

import HeroBanner from "./HeroBanner";
import LandingMenu from "./LandingMenu";
import FeaturedCategories from "./FeaturedCategories";
import HotCategories from "./HotCategories";
import ComfortEditorialBlock from "./ComfortEditorialBlock";
import ComfortRail from "./ComfortRail";

/**
 * ==================================================
 * LANDING CMS RENDERER — FINAL / PRODUCTION GRADE
 * ==================================================
 *
 * GUARANTEES:
 * - CMS controls ORDER & VISIBILITY only
 * - Renderer NEVER fetches data
 * - Renderer NEVER mutates data
 * - Renderer NEVER assumes availability
 * - Fully ID-driven (future proof)
 */

import type { LandingCMSBlock } from "@/lib/api/types";

// UI-normalized domain types
import type { HeroBannerItem } from "@/types/hero-banner";
import type { LandingMenuItem } from "@/types/landing-menu";
import type { FeaturedCategory } from "@/types/featured-category";
import type { HotCategory } from "@/types/hot-category";
import type { ComfortRail as UIComfortRail } from "@/types/comfort-rail";
import type { ComfortEditorialBlockData } from "./ComfortEditorialBlock";

/* ==================================================
   PROPS — STRICT & FUTURE-PROOF
================================================== */

type Props = {
  blocks: LandingCMSBlock[];

  heroBanners: HeroBannerItem[];
  landingMenuItems: LandingMenuItem[];
  featuredCategories: FeaturedCategory[];
  hotCategories: HotCategory[];

  comfortRails: UIComfortRail[];

  /**
   * 🔥 Editorial blocks (ID-addressable)
   * CMS decides WHICH one renders WHERE
   */
  comfortEditorialBlocks: ComfortEditorialBlockData[];
};

/* ==================================================
   COMPONENT
================================================== */

export default function LandingRenderer({
  blocks,
  heroBanners,
  landingMenuItems,
  featuredCategories,
  hotCategories,
  comfortRails,
  comfortEditorialBlocks,
}: Props) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          /* ================= HERO ================= */
          case "hero":
            return heroBanners.length ? (
              <HeroBanner key={key} banners={heroBanners} />
            ) : null;

          /* ================= MENU ================= */
          case "menu":
            return landingMenuItems.length ? (
              <LandingMenu key={key} items={landingMenuItems} />
            ) : null;

          /* ============== FEATURED ============== */
          case "featured":
            return featuredCategories.length ? (
              <FeaturedCategories
                key={key}
                items={featuredCategories}
              />
            ) : null;

          /* ================= HOT ================= */
          case "hot":
            return hotCategories.length ? (
              <HotCategories key={key} items={hotCategories} />
            ) : null;

          /* ============ COMFORT EDITORIAL ============ */
          case "comfort_block": {
            const editorial =
              "comfort_editorial_block_id" in block
                ? comfortEditorialBlocks.find(
                    (b) =>
                      b.id === block.comfort_editorial_block_id
                  )
                : null;

            if (!editorial) {
              console.warn(
                "⚠️ Comfort editorial block missing (ID:",
                "comfort_editorial_block_id" in block
                  ? block.comfort_editorial_block_id
                  : "unknown",
                ")"
              );
              return null;
            }

            return (
              <ComfortEditorialBlock
                key={key}
                block={editorial}
              />
            );
          }

          /* ============ COMFORT RAIL ============ */
          case "comfort_rail": {
            const rail = comfortRails.find(
              (r) => r.id === block.comfort_rail_id
            );

            if (!rail) {
              console.warn(
                "⚠️ Comfort rail missing (ID:",
                block.comfort_rail_id,
                ")"
              );
              return null;
            }

            return (
              <ComfortRail
                key={key}
                category={rail.category}
                products={rail.products}
              />
            );
          }

          /* ============== SAFE FALLBACK ============== */
          default:
            return null;
        }
      })}
    </>
  );
}
