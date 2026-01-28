"use client";

/**
 * ==================================================
 * ADMIN CMS — HERO BANNER (CREATE)
 * ==================================================
 *
 * Pure intent page.
 * No data fetching. No mutations.
 */

import "../hero-banners.css";
import HeroBannerForm from "../components/HeroBannerForm";

export default function AdminHeroBannerCreatePage() {
  return (
    <section className="hero-page">
      {/* ================= HEADER ================= */}
      <header className="hero-header">
        <div>
          <h1>New Hero Banner</h1>
          <p>Create a new landing page hero banner</p>
        </div>
      </header>

      {/* ================= FORM ================= */}
      <div className="hero-form-wrap">
        <HeroBannerForm mode="create" />
      </div>
    </section>
  );
}
