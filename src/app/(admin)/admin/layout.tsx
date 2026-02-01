"use client";

import React, { useEffect, useState } from "react";
import "./admin.css";

import AdminNav from "./components/AdminNav";
import { AdminToastProvider } from "../admin/components/AdminToastProvider";
import AdminAmbientBackground from "../admin/components/AdminAmbientBackground";

import { initCSRF } from "@/lib/admin-api/csrf";

/**
 * ==================================================
 * ADMIN ROOT LAYOUT
 * Archival Glass — Internal Admin System
 * ==================================================
 *
 * RESPONSIBILITIES:
 * - Global admin shell
 * - Sidebar + mobile navigation
 * - CSRF bootstrap (ONCE)
 * - Toast + ambient providers
 *
 * CSRF RULE:
 * - initCSRF() MUST run once
 * - MUST NOT block render
 * - MUST NOT throw
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * ==================================================
   * CSRF INITIALIZATION (RUN ONCE)
   * --------------------------------------------------
   * - Calls GET /api/csrf/
   * - Sets csrftoken cookie
   * - Required for ALL admin POST/PATCH/DELETE
   *
   * NOTE:
   * - Fire-and-forget (no await)
   * - Never blocks UI
   * - Never re-runs
   * ==================================================
   */
  useEffect(() => {
    initCSRF().catch(() => {
      // Silently ignore — admin APIs will fail loudly if CSRF is missing
      // This prevents layout crashes during cold backend starts
    });
  }, []);

  return (
    <AdminToastProvider>
      <div
        className={`admin-root ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        {/* ================= AMBIENT BACKGROUND ================= */}
        <AdminAmbientBackground />

        {/* ================= ADMIN SIDEBAR ================= */}
        <aside className="admin-sidebar">
          <AdminNav />
        </aside>

        {/* ================= ADMIN CONTENT ================= */}
        <main className="admin-main">
          {/* ===== MOBILE TOP BAR ===== */}
          <div className="admin-mobile-bar">
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin navigation"
              type="button"
            >
              <span />
              <span />
              <span />
            </button>

            <span className="admin-mobile-title">
              Admin
            </span>
          </div>

          <div className="admin-surface">
            {children}
          </div>
        </main>

        {/* ================= MOBILE OVERLAY ================= */}
        {sidebarOpen && (
          <div
            className="admin-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </AdminToastProvider>
  );
}
