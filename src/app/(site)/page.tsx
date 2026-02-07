import type { Metadata } from "next";

import LandingRenderer from "@/components/landing/LandingRenderer";

import {
  getLandingCMS,
  getHeroBanners,
  getLandingMenu,
  getFeaturedCategories,
  getHotCategories,
  getComfortRails,
  getComfortEditorialBlocks,
} from "@/lib/api/landing";

/* ==================================================
   SEO METADATA
================================================== */

export const metadata: Metadata = {
  title: "Exuberance | Premium Clothing & Fashion",
  description:
    "Discover premium quality clothing for men, women, and kids at Exuberance.",
};

/* ==================================================
   HOME PAGE — CMS-DRIVEN (PRODUCTION FINAL)
================================================== */

export default async function HomePage() {
  /**
   * Fetch ALL landing data in parallel.
   * Every function is defensive and returns []
   * so the homepage NEVER crashes.
   */
  const [
    blocks,
    heroBanners,
    landingMenuItems,
    featuredCategories,
    hotCategoryBlocks,
    comfortRails,
    comfortEditorialBlocks,
  ] = await Promise.all([
    getLandingCMS(),              // CMS layout (order only)
    getHeroBanners(),             // Hero banners
    getLandingMenu(),             // Top menu
    getFeaturedCategories(),      // Featured categories
    getHotCategories(),           // 🔥 HOT CATEGORY BLOCKS (IMPORTANT)
    getComfortRails(),            // Comfort rails
    getComfortEditorialBlocks(),  // Comfort editorial blocks
  ]);

  return (
    <main id="landing-page">
      <LandingRenderer
        blocks={blocks}
        heroBanners={heroBanners}
        landingMenuItems={landingMenuItems}
        featuredCategories={featuredCategories}
        hotCategoryBlocks={hotCategoryBlocks} // ✅ FIXED PROP NAME
        comfortRails={comfortRails}
        comfortEditorialBlocks={comfortEditorialBlocks}
      />
    </main>
  );
}
