"use client";

import Link from "next/link";
import ShopSidebar from "@/components/ShopSidebar";
import styles from "./MobileCategoryDrawer.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

/* ==================================================
   MOBILE CATEGORY DRAWER
   - Mobile-first
   - Touch friendly
   - Shop navigation focus
================================================== */
export default function MobileCategoryDrawer({
  open,
  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <>
      {/* ================= DRAWER ================= */}
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Shop menu"
      >
        {/* ================= HEADER ================= */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <span className={styles.title}>
              Browse Categories
            </span>

            <button
              onClick={onClose}
              className={styles.close}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </header>

        {/* ================= QUICK ACTIONS ================= */}
        <section className={styles.quickActions}>
          <Link
            href="/track-order"
            className={styles.quickLink}
            onClick={onClose}
          >
            <span className={styles.quickIcon}>📦</span>
            <span className={styles.quickText}>
              Track Order
            </span>
          </Link>
        </section>

        {/* ================= CONTENT ================= */}
        <section className={styles.content}>
          <ShopSidebar />
        </section>
      </aside>

      {/* ================= BACKDROP ================= */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
}
