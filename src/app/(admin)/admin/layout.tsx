"use client";

import React, { useEffect, useState } from "react";
import "./admin.css";

import AdminNav from "./components/AdminNav";
import { AdminToastProvider } from "../admin/components/AdminToastProvider";
import AdminAmbientBackground from "../admin/components/AdminAmbientBackground";

import { initCSRF } from "@/lib/admin-api/csrf";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔥 GUARANTEED CSRF BOOTSTRAP
  useEffect(() => {
    initCSRF().catch((err) => {
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
        <AdminAmbientBackground />

        <aside className="admin-sidebar">
          <AdminNav />
        </aside>

        <main className="admin-main">
          <div className="admin-mobile-bar">
            <button
              type="button"
              className="admin-hamburger"
              onClick={() => setSidebarOpen(true)}
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

        {sidebarOpen && (
          <div
            className="admin-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </AdminToastProvider>
  );
}
