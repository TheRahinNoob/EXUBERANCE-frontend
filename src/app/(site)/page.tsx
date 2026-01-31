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
   * Every function is defensive and returns [] on failure,
   * so the homepage NEVER crashes.
   */
  const [
    blocks,
    heroBanners,
    landingMenuItems,
    featuredCategories,
    hotCategories,
    comfortRails,
    comfortEditorialBlocks,
  ] = await Promise.all([
    getLandingCMS(),            // CMS layout (ORDER ONLY)
    getHeroBanners(),           // Hero content
    getLandingMenu(),           // Menu content
    getFeaturedCategories(),    // Featured categories
    getHotCategories(),         // Hot categories
    getComfortRails(),          // Comfort rails
    getComfortEditorialBlocks(),      // 🔥 Comfort editorial content
  ]);

  return (
    <main id="landing-page">
      <LandingRenderer
        blocks={blocks}
        heroBanners={heroBanners}
        landingMenuItems={landingMenuItems}
        featuredCategories={featuredCategories}
        hotCategories={hotCategories}
        comfortRails={comfortRails}
        comfortEditorialBlocks={comfortEditorialBlocks}
      />
    </main>
  );
}
