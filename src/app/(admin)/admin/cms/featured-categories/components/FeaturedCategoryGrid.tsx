"use client";

import { memo } from "react";
import "./featured-category-grid.css";

import type {
  AdminFeaturedCategory,
} from "@/lib/admin-api/cms/featured-categories";

import FeaturedCategoryCard from "./FeaturedCategoryCard";

/* ==================================================
   PROPS
================================================== */

type Props = {
  items: AdminFeaturedCategory[];
  onRefresh: () => void;
};

/* ==================================================
   COMPONENT
================================================== */

function FeaturedCategoryGrid({
  items,
  onRefresh,
}: Props) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      className="featured-grid"
      role="list"
      aria-label="Featured categories"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="listitem"
        >
          <FeaturedCategoryCard
            item={item}
            onRefresh={onRefresh}
          />
        </div>
      ))}
    </section>
  );
}

/* ==================================================
   EXPORT
================================================== */

export default memo(FeaturedCategoryGrid);
