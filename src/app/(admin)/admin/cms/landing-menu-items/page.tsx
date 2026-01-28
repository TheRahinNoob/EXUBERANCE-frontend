"use client";

/**
 * ==================================================
 * ADMIN CMS — LANDING MENU ITEMS (LIST)
 * ==================================================
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  fetchAdminLandingMenuItems,
  updateAdminLandingMenuItem,
} from "@/lib/admin-api";

import type { AdminLandingMenuItem } from "@/lib/admin-api";
import { useAdminToast } from "@/hooks/useAdminToast";

import "./landing-menu-items.css";

/* ==================================================
   PAGE
================================================== */

export default function AdminLandingMenuItemsPage() {
  const { showToast } = useAdminToast();

  const [items, setItems] = useState<AdminLandingMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ================= LOAD ================= */

  const loadItems = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminLandingMenuItems();

      if (!Array.isArray(data)) {
        throw new Error("Invalid landing menu response");
      }

      setItems(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load landing menu items";

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadItems();
    return () => abortRef.current?.abort();
  }, [loadItems]);

  /* ================= ACTIONS ================= */

  const toggleActive = async (item: AdminLandingMenuItem) => {
    try {
      await updateAdminLandingMenuItem(item.id, {
        is_active: !item.is_active,
      });

      showToast("Landing menu item updated", "success");
      loadItems();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Update failed",
        "error"
      );
    }
  };

  /* ================= STATES ================= */

  if (loading) {
    return <p className="admin-muted">Loading landing menu items…</p>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  /* ================= RENDER ================= */

  return (
    <section>
      {/* HEADER */}
      <header className="admin-page-header">
        <div>
          <h1>Landing Menu Items</h1>
          <p>Categories shown under the hero banner</p>
        </div>

        <Link
          href="/admin/cms/landing-menu-items/new"
          className="btn primary"
        >
          + Add Menu Item
        </Link>
      </header>

      {/* EMPTY */}
      {items.length === 0 && (
        <p className="admin-empty">
          No landing menu items configured.
        </p>
      )}

      {/* TABLE */}
      {items.length > 0 && (
        <div className="glass-table-wrap">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Active</th>
                <th>Order</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="category-name">
                    {item.category.name}
                  </td>

                  <td className="muted">
                    {item.category.slug}
                  </td>

                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.is_active}
                        onChange={() => toggleActive(item)}
                      />
                      <span />
                    </label>
                  </td>

                  <td>{item.ordering}</td>

                  <td className="row-actions">
                    <Link
                      href={`/admin/cms/landing-menu-items/${item.id}`}
                      className="link"
                    >
                      Edit
                    </Link>
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
