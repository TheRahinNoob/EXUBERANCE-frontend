/**
 * ==================================================
 * ADMIN CMS — EDIT LANDING MENU ITEM
 * ==================================================
 *
 * RESPONSIBILITY:
 * - Resolve dynamic route param (Next.js 16)
 * - Fetch existing landing menu item (server-side)
 * - Render edit form
 *
 * GUARANTEES:
 * - Server Component
 * - Django session auth preserved
 * - Backend is single source of truth
 */

import { notFound } from "next/navigation";

import type { AdminLandingMenuItem } from "@/lib/admin-api";
import { adminServerFetch } from "@/lib/admin-api/server";

import LandingMenuItemForm from "../components/LandingMenuItemForm";

/* ==================================================
   TYPES
================================================== */

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

/* ==================================================
   PAGE
================================================== */

export default async function EditLandingMenuItemPage({
  params,
}: PageProps) {
  /**
   * NEXT.JS 16:
   * params is Promise-based and MUST be awaited
   */
  const { id } = await params;
  const itemId = Number(id);

  if (!Number.isInteger(itemId)) {
    notFound();
  }

  /**
   * SERVER-AUTHENTICATED FETCH
   * - Cookies forwarded
   * - Django session preserved
   */
  const items =
    await adminServerFetch<AdminLandingMenuItem[]>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/cms/landing-menu-items/`
    );

  const existing = items.find(
    (item) => item.id === itemId
  );

  if (!existing) {
    notFound();
  }

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <section>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>
          Edit Landing Menu Item
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            maxWidth: 640,
          }}
        >
          Update visibility, ordering, or SEO overrides.
          The category cannot be changed after creation.
        </p>
      </header>

      <LandingMenuItemForm
        mode="edit"
        existing={existing}
      />
    </section>
  );
}
