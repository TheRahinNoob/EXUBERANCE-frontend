"use client";

/**
 * ==================================================
 * ADMIN CMS — HERO BANNER (EDIT PAGE)
 * ==================================================
 *
 * RESPONSIBILITY:
 * - Fetch a single hero banner by ID
 * - Render HeroBannerForm in EDIT mode
 *
 * DESIGN RULES:
 * - Backend is the source of truth
 * - No mutation logic here
 * - No inference or defaulting
 * - Django Admin change-view parity
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import {
  fetchAdminHeroBanners,
} from "@/lib/admin-api";

import type { AdminHeroBanner } from "@/lib/admin-api";

import { useAdminToast } from "@/hooks/useAdminToast";
import HeroBannerForm from "../../components/HeroBannerForm";

/* ==================================================
   PAGE
================================================== */

export default function AdminHeroBannerEditPage() {
  const { showToast } = useAdminToast();
  const params = useParams();

  const bannerId = Number(params.id);

  const [banner, setBanner] = useState<AdminHeroBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ==================================================
     LOAD BANNER
  ================================================== */

  const loadBanner = useCallback(async () => {
    if (!bannerId || Number.isNaN(bannerId)) {
      setError("Invalid hero banner ID");
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      /**
       * We intentionally reuse the LIST endpoint.
       * Reason:
       * - Keeps API surface minimal
       * - Django Admin does the same internally
       */
      const banners = await fetchAdminHeroBanners();

      const found = banners.find((b) => b.id === bannerId);

      if (!found) {
        throw new Error("Hero banner not found");
      }

      setBanner(found);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load hero banner";

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [bannerId, showToast]);

  /* ==================================================
     LIFECYCLE
  ================================================== */

  useEffect(() => {
    loadBanner();
    return () => abortRef.current?.abort();
  }, [loadBanner]);

  /* ==================================================
     RENDER STATES
  ================================================== */

  if (loading) {
    return (
      <p style={{ color: "#6b7280", fontSize: 14 }}>
        Loading hero banner…
      </p>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#b91c1c",
          padding: 12,
          borderRadius: 6,
        }}
      >
        {error}
      </div>
    );
  }

  if (!banner) {
    return (
      <p style={{ color: "#6b7280", fontSize: 14 }}>
        Hero banner not found.
      </p>
    );
  }

  /* ==================================================
     RENDER PAGE
  ================================================== */

  return (
    <section>
      {/* ================= HEADER ================= */}
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>
          Edit Hero Banner #{banner.id}
        </h1>

        <p style={{ color: "#6b7280", fontSize: 14 }}>
          Update images, visibility, and ordering
        </p>
      </header>

      {/* ================= FORM ================= */}
      <HeroBannerForm
        mode="edit"
        existing={banner}
      />
    </section>
  );
}
