/* ==================================================
   HOT CATEGORY — UI NORMALIZED TYPE
--------------------------------------------------
✔ Derived from APIHotCategory
✔ CMS-compatible
✔ UI-safe & future-proof
✔ NO backend-only leakage
================================================== */

export type HotCategory = {
  id: number;

  /**
   * 🔗 CMS linkage
   * Allows CMS "hot" blocks to target subsets if needed
   */
  hot_category_block_id?: number;

  name: string;
  slug: string;
  image: string | null;
};
