import type { Metadata } from "next";

import LandingRenderer from "@/components/landing/LandingRenderer";

import {
  getLandingCMS,
  getHeroBanners,
  getLandingMenu,
  getFeaturedCategories,
  getHotCategories,
  getComfortRails,
} from "@/lib/api";

/* ==================================================
   SEO METADATA
================================================== */

export const metadata: Metadata = {
  title: "Exuberance | Premium Clothing & Fashion",
  description:
    "Discover premium quality clothing for men, women, and kids at Exuberance.",
};

/* ==================================================
   HOME PAGE — TRUE CMS MODE (FINAL & CORRECT)
================================================== */
export default async function HomePage() {
  const [
    blocks,              // ✅ ALREADY items[]
    heroBanners,
    landingMenuItems,
    featuredCategories,
    hotCategories,
    comfortRails,
  ] = await Promise.all([
    getLandingCMS(),      // 🔥 FIXED SOURCE OF TRUTH
    getHeroBanners(),
    getLandingMenu(),
    getFeaturedCategories(),
    getHotCategories(),
    getComfortRails(),
  ]);

  console.log("🧠 CMS blocks passed to renderer:", blocks);

  return (
    <main id="landing-page">
      <LandingRenderer
        blocks={blocks}
        heroBanners={heroBanners}
        landingMenuItems={landingMenuItems}
        featuredCategories={featuredCategories}
        hotCategories={hotCategories}
        comfortRails={comfortRails}
      />
    </main>
  );
}
