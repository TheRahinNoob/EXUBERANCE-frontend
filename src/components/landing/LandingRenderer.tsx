"use client";

import HeroBanner from "./HeroBanner";
import LandingMenu from "./LandingMenu";
import FeaturedCategories from "./FeaturedCategories";
import HotCategories from "./HotCategories";
import ComfortBlock from "./ComfortBlock";
import ComfortRail from "./ComfortRail";

import type {
  LandingCMSBlock,
  ComfortRail as ComfortRailType,
  HotCategory,
} from "@/lib/api/types";

/* ==================================================
   LANDING CMS RENDERER (PRODUCTION–SAFE)
================================================== */

type Props = {
  blocks: LandingCMSBlock[];

  heroBanners: any[];
  landingMenuItems: any[];
  featuredCategories: any[];
  hotCategories: HotCategory[];
  comfortRails: ComfortRailType[];
};

export default function LandingRenderer({
  blocks,
  heroBanners,
  landingMenuItems,
  featuredCategories,
  hotCategories,
  comfortRails,
}: Props) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          /* =========================
             HERO
          ========================= */
          case "hero":
            return heroBanners.length > 0 ? (
              <HeroBanner
                key={`hero-${index}`}
                banners={heroBanners}
              />
            ) : null;

          /* =========================
             MENU
          ========================= */
          case "menu":
            return landingMenuItems.length > 0 ? (
              <LandingMenu
                key={`menu-${index}`}
                items={landingMenuItems}
              />
            ) : null;

          /* =========================
             FEATURED
          ========================= */
          case "featured":
            return featuredCategories.length > 0 ? (
              <FeaturedCategories
                key={`featured-${index}`}
                items={featuredCategories}
              />
            ) : null;

          /* =========================
             HOT (🔥 COLLECTIVE, CMS-DRIVEN)
          ========================= */
          case "hot": {
            if (!block.hot_category_block_id) return null;

            const items = hotCategories.filter(
              (c) =>
                Number(c.hot_category_block_id) ===
                Number(block.hot_category_block_id)
            );

            if (!items || items.length === 0) {
              console.warn(
                "⚠️ Hot category block empty or missing (ID:",
                block.hot_category_block_id,
                ")"
              );
              return null;
            }

            return (
              <HotCategories
                key={`hot-block-${block.hot_category_block_id}`}
                items={items}
              />
            );
          }

          /* =========================
             COMFORT EDITORIAL
          ========================= */
          case "comfort_block":
            return (
              <ComfortBlock
                key={`comfort-block-${index}`}
              />
            );

          /* =========================
             COMFORT RAIL
          ========================= */
          case "comfort_rail": {
            const rail = comfortRails.find(
              (r) =>
                Number(r.id) ===
                Number(block.comfort_rail_id)
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
                key={`rail-${rail.id}`}
                category={rail.category}
                products={rail.products}
              />
            );
          }

          /* =========================
             UNKNOWN (SAFE FAIL)
          ========================= */
          default:
            return null;
        }
      })}
    </>
  );
}
