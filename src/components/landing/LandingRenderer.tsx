"use client";

import HeroBanner from "./HeroBanner";
import LandingMenu from "./LandingMenu";
import FeaturedCategories from "./FeaturedCategories";
import HotCategories from "./HotCategories";
import ComfortEditorialBlock from "./ComfortEditorialBlock";
import ComfortRail from "./ComfortRail";

import type { LandingCMSBlock } from "@/lib/api/types";

// UI-normalized domain types
import type { HeroBannerItem } from "@/types/hero-banner";
import type { LandingMenuItem } from "@/types/landing-menu";
import type { FeaturedCategory } from "@/types/featured-category";
import type { ComfortRail as UIComfortRail } from "@/types/comfort-rail";
import type { ComfortEditorialBlockData } from "./ComfortEditorialBlock";
import type { HotCategoryBlock } from "./HotCategories";

/* ==================================================
   PROPS
================================================== */

type Props = {
  blocks?: LandingCMSBlock[];

  heroBanners?: HeroBannerItem[];
  landingMenuItems?: LandingMenuItem[];
  featuredCategories?: FeaturedCategory[];

  /** CMS hot blocks (MULTIPLE allowed) */
  hotCategoryBlocks?: HotCategoryBlock[];

  comfortRails?: UIComfortRail[];
  comfortEditorialBlocks?: ComfortEditorialBlockData[];
};

/* ==================================================
   COMPONENT
================================================== */

export default function LandingRenderer({
  blocks,
  heroBanners = [],
  landingMenuItems = [],
  featuredCategories = [],
  hotCategoryBlocks = [],
  comfortRails = [],
  comfortEditorialBlocks = [],
}: Props) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    console.warn("❌ No CMS blocks provided");
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${block.id ?? index}`;

        switch (block.type) {
          case "hero": {
            if (heroBanners.length === 0) return null;
            return <HeroBanner key={key} banners={heroBanners} />;
          }

          case "menu": {
            if (landingMenuItems.length === 0) return null;
            return <LandingMenu key={key} items={landingMenuItems} />;
          }

          case "featured": {
            if (featuredCategories.length === 0) return null;
            return (
              <FeaturedCategories
                key={key}
                items={featuredCategories}
              />
            );
          }

          case "hot": {
            if (!block.hot_category_block_id) {
              console.warn(
                "⚠️ hot block missing hot_category_block_id",
                block
              );
              return null;
            }

            if (hotCategoryBlocks.length === 0) {
              console.warn("⚠️ hotCategoryBlocks is empty");
              return null;
            }

            const hotBlock = hotCategoryBlocks.find(
              (b) => b.id === block.hot_category_block_id
            );

            if (!hotBlock) {
              console.warn(
                "⚠️ No matching hot category block found for id",
                block.hot_category_block_id
              );
              return null;
            }

            return <HotCategories key={key} block={hotBlock} />;
          }

          case "comfort_block": {
            if (!block.comfort_editorial_block_id) return null;

            const editorial = comfortEditorialBlocks.find(
              (b) => b.id === block.comfort_editorial_block_id
            );

            if (!editorial) return null;

            return (
              <ComfortEditorialBlock
                key={key}
                block={editorial}
              />
            );
          }

          case "comfort_rail": {
            if (!block.comfort_rail_id) return null;

            const rail = comfortRails.find(
              (r) => r.id === block.comfort_rail_id
            );

            if (!rail) return null;

            return (
              <ComfortRail
                key={key}
                category={rail.category}
                products={rail.products}
              />
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}
