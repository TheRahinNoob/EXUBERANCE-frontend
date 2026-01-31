"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ==================================================
   ADMIN NAV — PRODUCTION GRADE (STYLE READY)
================================================== */

/**
 * Determines whether a nav item should be active.
 *
 * Rules:
 * - "/admin" matches ONLY dashboard
 * - All other paths match exact or nested routes
 */
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav">
      {/* ================= BRAND / TITLE ================= */}
      <h2 className="admin-nav-title">Admin</h2>

      <ul className="admin-nav-list">
        {/* ================= DASHBOARD ================= */}
        <li className="admin-nav-item">
          <Link
            href="/admin"
            className={`admin-nav-link ${
              isActivePath(pathname, "/admin") ? "active" : ""
            }`}
          >
            Dashboard
          </Link>
        </li>

        {/* ================= ORDERS ================= */}
        <li className="admin-nav-group">
          <span className="admin-nav-group-title">Orders</span>
          <ul className="admin-nav-sublist">
            <li>
              <Link
                href="/admin/orders"
                className={`admin-nav-link ${
                  isActivePath(pathname, "/admin/orders") ? "active" : ""
                }`}
              >
                All Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders?status=pending"
                className="admin-nav-link"
              >
                Pending
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders?status=shipped"
                className="admin-nav-link"
              >
                Shipped
              </Link>
            </li>
          </ul>
        </li>

        {/* ================= PRODUCTS ================= */}
        <li className="admin-nav-group">
          <span className="admin-nav-group-title">Products</span>
          <ul className="admin-nav-sublist">
            <li>
              <Link
                href="/admin/products"
                className={`admin-nav-link ${
                  isActivePath(pathname, "/admin/products") ? "active" : ""
                }`}
              >
                All Products
              </Link>
            </li>

            <li>
              <Link
                href="/admin/categories"
                className={`admin-nav-link ${
                  isActivePath(pathname, "/admin/categories") ? "active" : ""
                }`}
              >
                Categories
              </Link>
            </li>

            <li>
              <Link
                href="/admin/attributes"
                className={`admin-nav-link ${
                  isActivePath(pathname, "/admin/attributes") ? "active" : ""
                }`}
              >
                Attributes
              </Link>
            </li>
          </ul>
        </li>

        {/* ================= CMS ================= */}
        <li className="admin-nav-group">
          <span className="admin-nav-group-title">CMS</span>
          <ul className="admin-nav-sublist">
            <li>
              <Link
                href="/admin/cms/hero-banners"
                className={`admin-nav-link ${
                  isActivePath(pathname, "/admin/cms/hero-banners")
                    ? "active"
                    : ""
                }`}
              >
                Hero Banners
              </Link>
            </li>

            <li>
              <Link
                href="/admin/cms/landing-menu-items"
                className={`admin-nav-link ${
                  isActivePath(
                    pathname,
                    "/admin/cms/landing-menu-items"
                  )
                    ? "active"
                    : ""
                }`}
              >
                Landing Menu
              </Link>
            </li>

            <li>
              <Link
                href="/admin/cms/featured-categories"
                className={`admin-nav-link ${
                  isActivePath(
                    pathname,
                    "/admin/cms/featured-categories"
                  )
                    ? "active"
                    : ""
                }`}
              >
                Featured Categories
              </Link>
            </li>

            <li>
              <Link
                href="/admin/cms/hot-categories"
                className={`admin-nav-link ${
                  isActivePath(
                    pathname,
                    "/admin/cms/hot-categories"
                  )
                    ? "active"
                    : ""
                }`}
              >
                Hot Categories
              </Link>
            </li>

            <li>
              <Link
                href="/admin/cms/hot-category-blocks"
                className={`admin-nav-link ${
                  isActivePath(
                    pathname,
                    "/admin/cms/hot-category-blocks"
                  )
                    ? "active"
                    : ""
                }`}
              >
                Hot Category Blocks
              </Link>
            </li>

            <li>
              <Link
                href="/admin/cms/comfort-editorial"
                className={`admin-nav-link ${
                  isActivePath(
                    pathname,
                    "/admin/cms/comfort-editorial"
                  )
                    ? "active"
                    : ""
                }`}
              >
                Comfort Editorial
              </Link>
            </li>

            <li>
              <Link
                href="/admin/cms/comfort-rails"
                className={`admin-nav-link ${
                  isActivePath(
                    pathname,
                    "/admin/cms/comfort-rails"
                  )
                    ? "active"
                    : ""
                }`}
              >
                Comfort Rails
              </Link>
            </li>

            <li>
              <Link
                href="/admin/cms/landing"
                className={`admin-nav-link ${
                  isActivePath(pathname, "/admin/cms/landing")
                    ? "active"
                    : ""
                }`}
              >
                Landing Page
              </Link>
            </li>

            <li>
              <Link
                href="/admin/cms/sections"
                className={`admin-nav-link ${
                  isActivePath(pathname, "/admin/cms/sections")
                    ? "active"
                    : ""
                }`}
              >
                Sections
              </Link>
            </li>
          </ul>
        </li>

        {/* ================= OTHER ================= */}
        <li className="admin-nav-item">
          <Link
            href="/admin/couriers"
            className={`admin-nav-link ${
              isActivePath(pathname, "/admin/couriers") ? "active" : ""
            }`}
          >
            Couriers
          </Link>
        </li>

        <li className="admin-nav-item">
          <Link
            href="/admin/settings"
            className={`admin-nav-link ${
              isActivePath(pathname, "/admin/settings") ? "active" : ""
            }`}
          >
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
}
