"use client";

import React, { useEffect, useState } from "react";
import "./admin.css";

import AdminNav from "./components/AdminNav";
import { AdminToastProvider } from "../admin/components/AdminToastProvider";
import AdminAmbientBackground from "../admin/components/AdminAmbientBackground";

import { initCSRFOnce } from "@/lib/admin-api/config";

/**
 * ==================================================
 * ADMIN ROOT LAYOUT
 * Archival Glass — Internal Admin System
 * ==================================================
 *
 * RESPONSIBILITIES:
 * - Global admin shell
 * - Sidebar + mobile navigation
 * - CSRF bootstrap (ONCE, race-safe)
 * - Toast + ambient providers
 *
 * CSRF GUARANTEE:
 * - initCSRFOnce() runs exactly once
 * - All admin API calls WAIT for it automatically
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * ==================================================
   * CSRF INITIALIZATION (GLOBAL, SAFE)
   * --------------------------------------------------
   * - Calls GET /api/csrf/ once
   * - Stores csrftoken in memory
   * - adminFetch() will await this automatically
   *
   * IMPORTANT:
   * - Fire-and-forget
   * - Must NOT block render
   * ==================================================
   */
  useEffect(() => {
    initCSRFOnce().catch((err) => {
      console.error("[CSRF INIT FAILED]", err);
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
