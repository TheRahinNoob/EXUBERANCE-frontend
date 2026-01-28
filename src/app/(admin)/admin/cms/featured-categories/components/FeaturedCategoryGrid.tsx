"use client";

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

export default function FeaturedCategoryGrid({
  items,
  onRefresh,
}: Props) {
  return (
    <section className="featured-grid">
      {items.map((item) => (
        <FeaturedCategoryCard
          key={item.id}
          item={item}
          onRefresh={onRefresh}
        />
      ))}
    </section>
  );
}
