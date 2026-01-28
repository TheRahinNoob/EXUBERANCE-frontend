"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCategories } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";

import ShopSidebar from "@/components/ShopSidebar"; // 🔥 IMPORTANT
import styles from "./Navbar.module.css";

type Category = {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
};

export default function Navbar() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);

  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
    setMobileSearchOpen(false);
    setMobileDrawerOpen(false);
  }

  if (!mounted) return null;

  return (
    <>
      {/* =========================
         NAVBAR
      ========================= */}
      <header className={styles.nav}>
        <div className={styles.container}>
          {/* LEFT */}
          <div className={styles.left}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
            >
              <i className="fa fa-bars" />
            </button>

            <Link href="/" className={styles.logo}>
              EXUBERANCE
            </Link>

            {/* DESKTOP SHOP */}
            <div
              className={styles.shop}
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className={styles.shopBtn}>
                Shop <i className="fa fa-angle-down" />
              </button>

              <div
                className={`${styles.mega} ${
                  megaOpen ? styles.megaOpen : ""
                }`}
              >
                <div className={styles.megaGrid}>
                  {categories.map((cat) => (
                    <div key={cat.id} className={styles.megaCol}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className={styles.megaTitle}
                      >
                        {cat.name}
                      </Link>

                      {cat.children?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.slug}`}
                          className={styles.megaLink}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER (DESKTOP SEARCH) */}
          <div className={styles.center}>
            <form
              onSubmit={handleSearchSubmit}
              className={styles.searchForm}
            >
              <input
                className={styles.searchInput}
                placeholder="Search Products by Titles or Tags"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />
              <button className={styles.searchBtn}>
                <i className="fa fa-search" />
              </button>
            </form>
          </div>

          {/* RIGHT */}
          <div className={styles.right}>
            <button
              className={styles.mobileSearchBtn}
              onClick={() =>
                setMobileSearchOpen((v) => !v)
              }
            >
              <i className="fa fa-search" />
            </button>

            {/* TRACK ORDER (DESKTOP) */}
            <Link
              href="/order-track"
              className={styles.trackOrder}
            >
              <i className="fa fa-map-marker-alt" />
              <span>Track Order</span>
            </Link>

            {/* CART */}
            <Link href="/cart" className={styles.cart}>
              <i className="fa fa-shopping-cart" />
              {totalItems > 0 && (
                <span className={styles.cartBadge}>
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* =========================
         MOBILE SEARCH
      ========================= */}
      {mobileSearchOpen && (
        <div className={styles.mobileSearch}>
          <form onSubmit={handleSearchSubmit}>
            <input
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />
          </form>
        </div>
      )}

      {/* =========================
         MOBILE DRAWER
      ========================= */}
      <aside
        className={`${styles.mobileDrawer} ${
          mobileDrawerOpen
            ? styles.mobileDrawerOpen
            : ""
        }`}
      >
        <div className={styles.mobileDrawerHeader}>
          <span>Menu</span>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close menu"
          >
            <i className="fa fa-times" />
          </button>
        </div>

        {/* ✅ TRACK ORDER (MOBILE) */}
        <div className={styles.mobileQuickActions}>
          <Link
            href="/order-track"
            className={styles.mobileQuickLink}
            onClick={() => setMobileDrawerOpen(false)}
          >
            📦 Track Order
          </Link>
        </div>

        {/* CATEGORIES */}
        <ShopSidebar />
      </aside>

      {mobileDrawerOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}
    </>
  );
}
