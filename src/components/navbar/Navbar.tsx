"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCategories } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";

import ShopSidebar from "@/components/ShopSidebar";
import styles from "./Navbar.module.css";

type Category = {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

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

  const whatsappHref = "https://wa.me/8801703572458";

  const isHomeActive = pathname === "/";
  const isShopActive =
    pathname === "/shop" || pathname.startsWith("/category/");
  const isCartActive = pathname === "/cart";
  const isTrackActive = pathname === "/order-track";

  return (
    <>
      {/* =========================
         TOP NAVBAR
      ========================= */}
      <header className={styles.nav}>
        <div className={styles.container}>
          {/* LEFT */}
          <div className={styles.left}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
              type="button"
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
              <button className={styles.shopBtn} type="button">
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
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <input
                className={styles.searchInput}
                placeholder="Search Products by Titles or Tags"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className={styles.searchBtn} type="submit" aria-label="Search">
                <i className="fa fa-search" />
              </button>
            </form>
          </div>

          {/* RIGHT */}
          <div className={styles.right}>
            <button
              className={styles.mobileSearchBtn}
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Open search"
              type="button"
            >
              <i className="fa fa-search" />
            </button>

            {/* TRACK ORDER (DESKTOP) */}
            <Link href="/order-track" className={styles.trackOrder}>
              <i className="fa fa-map-marker-alt" />
              <span></span>
            </Link>

            {/* CART */}
            <Link href="/cart" className={styles.cart} aria-label="Cart">
              <i className="fa fa-shopping-cart" />
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      )}

      {/* =========================
         MOBILE DRAWER
      ========================= */}
      <aside
        className={`${styles.mobileDrawer} ${
          mobileDrawerOpen ? styles.mobileDrawerOpen : ""
        }`}
      >
        <div className={styles.mobileDrawerHeader}>
          <span>Menu</span>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close menu"
            type="button"
          >
            <i className="fa fa-times" />
          </button>
        </div>

        <div className={styles.mobileQuickActions}>
          <Link
            href="/order-track"
            className={styles.mobileQuickLink}
            onClick={() => setMobileDrawerOpen(false)}
          >
            📦 Track Order
          </Link>
        </div>

        <ShopSidebar />
      </aside>

      {mobileDrawerOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* =========================
         MOBILE BOTTOM NAV
      ========================= */}
      <nav
        className={styles.mobileBottomNav}
        aria-label="Mobile bottom navigation"
      >
        <Link
          href="/"
          className={`${styles.mobileBottomItem} ${
            isHomeActive ? styles.mobileBottomItemActive : ""
          }`}
          aria-label="Home"
        >
          <span className={styles.mobileBottomIcon}>
            <i className="fa fa-home" />
          </span>
          <span className={styles.mobileBottomLabel}>Home</span>
        </Link>

        <Link
          href="/shop"
          className={`${styles.mobileBottomItem} ${
            isShopActive ? styles.mobileBottomItemActive : ""
          }`}
          aria-label="Category"
        >
          <span className={styles.mobileBottomIcon}>
            <i className="fa fa-th-large" />
          </span>
          <span className={styles.mobileBottomLabel}>Category</span>
        </Link>

        <Link
          href="/cart"
          className={`${styles.mobileBottomItem} ${
            isCartActive ? styles.mobileBottomItemActive : ""
          }`}
          aria-label="Cart"
        >
          <span
            className={`${styles.mobileBottomIcon} ${styles.mobileBottomCartIcon}`}
          >
            <i className="fa fa-shopping-bag" />
            {totalItems > 0 && (
              <span className={styles.mobileBottomBadge}>
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </span>
          <span className={styles.mobileBottomLabel}>Cart</span>
        </Link>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mobileBottomItem}
          aria-label="WhatsApp"
        >
          <span className={styles.mobileBottomIcon}>
            <i className="fa-brands fa-whatsapp" />
          </span>
          <span className={styles.mobileBottomLabel}>WhatsApp</span>
        </a>

        <Link
          href="/order-track"
          className={`${styles.mobileBottomItem} ${
            isTrackActive ? styles.mobileBottomItemActive : ""
          }`}
          aria-label="Track order"
        >
          <span className={styles.mobileBottomIcon}>
            <i className="fa fa-location-arrow" />
          </span>
          <span className={styles.mobileBottomLabel}>Track</span>
        </Link>
      </nav>

      {/* spacer so page content doesn't hide behind bottom nav */}
      <div className={styles.mobileBottomNavSpacer} />
    </>
  );
}