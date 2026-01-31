"use client";

/**
 * ==================================================
 * ADMIN CMS — HERO BANNERS (RESPONSIVE READY)
 * ==================================================
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./hero-banners.css";

import {
  fetchAdminHeroBanners,
  deleteAdminHeroBanner,
} from "@/lib/admin-api";

import type { AdminHeroBanner } from "@/lib/admin-api";
import { resolveMediaUrl } from "@/lib/admin-api/media";
import { useAdminToast } from "@/hooks/useAdminToast";

/* ==================================================
   PAGE
================================================== */

export default function AdminHeroBannerPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();

  const [banners, setBanners] = useState<AdminHeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ================= LOAD ================= */

  const loadBanners = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminHeroBanners();

      if (!Array.isArray(data)) {
        throw new Error("Invalid hero banner response");
      }

      setBanners(data);
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load hero banners";

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadBanners();
    return () => abortRef.current?.abort();
  }, [loadBanners]);

  /* ================= DELETE ================= */

  const handleDelete = async (
    banner: AdminHeroBanner,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (
      !confirm(
        `Delete hero banner #${banner.id}?\n\nThis cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteAdminHeroBanner(banner.id);
      showToast("Hero banner deleted", "success");
      loadBanners();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Delete failed",
        "error"
      );
    }
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="admin-muted">
        Loading hero banners…
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        {error}
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <section className="hero-page">
      {/* ===== HEADER ===== */}
      <header className="hero-header">
        <div>
          <h1>Hero Banners</h1>
          <p>Manage landing page hero banners</p>
        </div>

        <button
          className="btn primary"
          onClick={() =>
            router.push(
              "/admin/cms/hero-banners/create"
            )
          }
        >
          + Create Banner
        </button>
      </header>

      {/* ===== EMPTY ===== */}
      {banners.length === 0 && (
        <div className="admin-muted italic">
          No hero banners configured.
        </div>
      )}

      {/* ===== TABLE ===== */}
      {banners.length > 0 && (
        <div className="hero-table-wrap">
          <table className="hero-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Desktop</th>
                <th>Tablet</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Live</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {banners.map((banner) => (
                <tr
                  key={banner.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    router.push(
                      `/admin/cms/hero-banners/${banner.id}/edit`
                    )
                  }
                >
                  <td data-label="ID" className="mono">
                    {banner.id}
                  </td>

                  <ImageCell
                    src={banner.image_desktop}
                    label="Desktop"
                  />
                  <ImageCell
                    src={banner.image_tablet}
                    label="Tablet"
                  />
                  <ImageCell
                    src={banner.image_mobile}
                    label="Mobile"
                  />

                  <td data-label="Status">
                    {banner.is_active ? (
                      <span className="badge active">
                        Active
                      </span>
                    ) : (
                      <span className="badge muted">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td data-label="Live">
                    {banner.is_live ? (
                      <span className="badge live">
                        Live
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td
                    data-label="Actions"
                    className="actions"
                  >
                    <button
                      className="danger"
                      onClick={(e) =>
                        handleDelete(banner, e)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ==================================================
   IMAGE CELL
================================================== */

function ImageCell({
  src,
  label,
}: {
  src: string | null;
  label: string;
}) {
  const resolved = resolveMediaUrl(src);

  if (!resolved) {
    return (
      <td data-label={label} className="empty">
        —
      </td>
    );
  }

  return (
    <td data-label={label}>
      <img
        src={resolved}
        alt={`${label} hero banner`}
        loading="lazy"
      />
    </td>
  );
}
