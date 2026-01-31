"use client";

import React, { useState } from "react";
import "./admin.css";

import AdminNav from "./components/AdminNav";
import { AdminToastProvider } from "../admin/components/AdminToastProvider";
import AdminAmbientBackground from "../admin/components/AdminAmbientBackground";

/**
 * ==================================================
 * ADMIN ROOT LAYOUT
 * Archival Glass — Internal Admin System
 * Mobile Sidebar Enabled
 * ==================================================
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
