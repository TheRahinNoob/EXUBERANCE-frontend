"use client";

import Link from "next/link";
import ShopSidebar from "@/components/ShopSidebar";
import styles from "./MobileCategoryDrawer.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileCategoryDrawer({
  open,
  onClose,
}: Props) {
  return (
    <>
      {/* DRAWER */}
      <aside
        className={`${styles.drawer} ${
          open ? styles.open : ""
        }`}
      >
        {/* HEADER */}
        <div className={styles.header}>
          <span>Menu</span>
          <button
            onClick={onClose}
            className={styles.close}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* =========================
            QUICK ACTIONS
        ========================= */}
        <div className={styles.quickActions}>
          <Link
            href="/track-order"
            className={styles.quickLink}
            onClick={onClose}
          >
            📦 Track Order
          </Link>
        </div>

        {/* =========================
            CATEGORIES / FILTERS
        ========================= */}
        <div className={styles.content}>
          <ShopSidebar />
        </div>
      </aside>

      {/* BACKDROP */}
      {open && (
        <div
          className={styles.backdrop}
          onClick={onClose}
        />
      )}
    </>
  );
}
