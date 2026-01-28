"use client";

/**
 * ==================================================
 * ADMIN CMS — CREATE LANDING MENU ITEM
 * ==================================================
 *
 * RESPONSIBILITY:
 * - Render create page for landing menu items
 * - Delegate ALL logic to form component
 *
 * RULES:
 * - This page does NOT mutate data
 * - Backend is the single source of truth
 * - Form handles validation & submission
 */

import LandingMenuItemForm from "../components/LandingMenuItemForm";
import "./create-landing-menu-item.css";

/* ==================================================
   PAGE
================================================== */

export default function CreateLandingMenuItemPage() {
  return (
    <section className="admin-page">
      {/* ================= HEADER ================= */}
      <header className="admin-page-header">
        <div>
          <h1>Create Landing Menu Item</h1>
          <p>
            Add a category to the landing page body menu.
            Each category can appear only once and must be active.
          </p>
        </div>
      </header>

      {/* ================= FORM ================= */}
      <div className="admin-form-shell">
        <LandingMenuItemForm mode="create" />
      </div>
    </section>
  );
}
