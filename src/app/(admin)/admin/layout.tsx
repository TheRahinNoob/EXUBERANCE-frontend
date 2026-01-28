"use client";

import React from "react";
import "./admin.css";

import AdminNav from "./components/AdminNav";
import { AdminToastProvider } from "../admin/components/AdminToastProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminToastProvider>
      <div className="admin-root">
        {/* ================= ADMIN SIDEBAR ================= */}
        <aside className="admin-sidebar">
          <AdminNav />
        </aside>

        {/* ================= ADMIN CONTENT ================= */}
        <main className="admin-main">
          <div className="admin-surface">
            {children}
          </div>
        </main>
      </div>
    </AdminToastProvider>
  );
}
