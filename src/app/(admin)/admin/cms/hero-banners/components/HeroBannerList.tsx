"use client";

/**
 * ==================================================
 * HERO BANNER LIST
 * ==================================================
 */

import type { AdminHeroBanner } from "@/lib/admin-api/cms/hero-banners";
import "./hero-banner-list.css";

type Props = {
  banners: AdminHeroBanner[];
  onDelete: (banner: AdminHeroBanner) => void;
};

export default function HeroBannerList({
  banners,
  onDelete,
}: Props) {
  if (banners.length === 0) {
    return (
      <p className="hero-empty">
        No hero banners created yet.
      </p>
    );
  }

  return (
    <div className="hero-table-wrap">
      <table className="hero-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Status</th>
            <th>Schedule</th>
            <th>Order</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {banners.map((banner) => (
            <tr key={banner.id}>
              {/* PREVIEW */}
              <td>
                {banner.image_desktop ? (
                  <img
                    src={banner.image_desktop}
                    alt="Hero banner"
                    className="hero-preview"
                  />
                ) : (
                  <span className="hero-dash">—</span>
                )}
              </td>

              {/* STATUS */}
              <td>
                {banner.is_live ? (
                  <span className="status live">Live</span>
                ) : banner.is_active ? (
                  <span className="status scheduled">
                    Scheduled
                  </span>
                ) : (
                  <span className="status inactive">
                    Inactive
                  </span>
                )}
              </td>

              {/* SCHEDULE */}
              <td className="hero-muted">
                {banner.starts_at || banner.ends_at ? (
                  <>
                    {banner.starts_at ?? "—"} →{" "}
                    {banner.ends_at ?? "—"}
                  </>
                ) : (
                  "Always"
                )}
              </td>

              {/* ORDER */}
              <td>{banner.ordering}</td>

              {/* ACTION */}
              <td className="hero-actions">
                <button
                  className="danger"
                  onClick={() => onDelete(banner)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
