// ==================================================
// PUBLIC API ENTRY POINT
// ==================================================

// ❌ DO NOT EXPORT RAW API TYPES
// export * from "./types";  ← REMOVED

// Only expose domain-safe APIs
export * from "./categories";
export * from "./products";

// ==================================================
// CMS APIs (FRONTEND SAFE)
// ==================================================

import type {
  ApiBlockResponse,
  LandingCMSBlock,
} from "./types"; // ✅ INTERNAL USE ONLY

import {
  getLandingCMS as fetchLandingCMS, // internal raw fetch
  getHeroBanners,
  getLandingMenu,
  getFeaturedCategories,
  getHotCategories,
  getComfortRails,
} from "./landing";

// ==================================================
// CMS — NORMALIZED (SAFE FOR UI)
// ==================================================
export async function getLandingCMS(): Promise<
  LandingCMSBlock[]
> {
  const response: ApiBlockResponse<LandingCMSBlock> =
    await fetchLandingCMS();

  if (
    !response ||
    !Array.isArray(response.items)
  ) {
    console.warn(
      "[API] Invalid CMS response:",
      response
    );
    return [];
  }

  return response.items;
}

// ==================================================
// ATOMIC LANDING EXPORTS
// ==================================================
export {
  getHeroBanners,
  getLandingMenu,
  getFeaturedCategories,
  getHotCategories,
  getComfortRails,
};
