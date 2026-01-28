"use client";

import Link from "next/link";
import styles from "./LandingMenu.module.css";

/* =========================
   TYPES
========================= */
export type LandingMenuItem = {
  name: string;
  slug: string;
};

/* =========================
   LANDING MENU
========================= */
export default function LandingMenu({
  items,
}: {
  items: LandingMenuItem[];
}) {
  return (
    <nav className={styles.menu} role="navigation">
      <div className={styles.inner}>
        <ul className={styles.list}>
          {/* SHOP NOW */}
          <li className={styles.cell}>
            <Link href="/shop" className={`${styles.item} ${styles.shopNow}`}>
              SHOP NOW
            </Link>
          </li>

          {/* DYNAMIC ITEMS */}
          {items.map((item) => (
            <li key={item.slug} className={styles.cell}>
              <Link
                href={`/category/${item.slug}`}
                className={styles.item}
              >
                {item.name.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
