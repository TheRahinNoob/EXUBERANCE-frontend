"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

const WHATSAPP_NUMBER = "8801703572458";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* =========================
           TOP
        ========================= */}
        <div className={styles.top}>
          {/* BRAND */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand} aria-label="Exuberance home">
              EXUBERANCE
            </Link>

            <p className={styles.brandText}>
              Premium lifestyle and fashion pieces designed for everyday style,
              comfort, and confidence.
            </p>

            <div className={styles.socials} aria-label="Social links">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Facebook"
              >
                <i className="fa-brands fa-facebook-f" />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram" />
              </a>
            </div>
          </div>

          {/* SHOP */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Shop</h3>
            <nav className={styles.linkList} aria-label="Shop links">
              <Link href="/shop" className={styles.footerLink}>
                All Products
              </Link>
              <Link href="/shop" className={styles.footerLink}>
                New Arrivals
              </Link>
              <Link href="/shop" className={styles.footerLink}>
                Best Sellers
              </Link>
              <Link href="/cart" className={styles.footerLink}>
                Cart
              </Link>
            </nav>
          </div>

          {/* SUPPORT */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Support</h3>
            <nav className={styles.linkList} aria-label="Support links">
              <Link href="/order-track" className={styles.footerLink}>
                Track Order
              </Link>
              <Link href="/contact" className={styles.footerLink}>
                Contact Us
              </Link>
              <Link href="/faq" className={styles.footerLink}>
                FAQ
              </Link>
              <Link href="/shipping-and-returns" className={styles.footerLink}>
                Shipping & Returns
              </Link>
            </nav>
          </div>

          {/* COMPANY */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Company</h3>
            <nav className={styles.linkList} aria-label="Company links">
              <Link href="/about" className={styles.footerLink}>
                About Us
              </Link>
              <Link href="/privacy-policy" className={styles.footerLink}>
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className={styles.footerLink}>
                Terms & Conditions
              </Link>
            </nav>
          </div>
        </div>

        {/* =========================
           HIGHLIGHT STRIP
        ========================= */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>
              <i className="fa-solid fa-truck-fast" />
            </span>
            <div>
              <p className={styles.featureTitle}>Fast Delivery</p>
              <p className={styles.featureText}>Quick and reliable nationwide shipping.</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>
              <i className="fa-solid fa-shield-heart" />
            </span>
            <div>
              <p className={styles.featureTitle}>Trusted Quality</p>
              <p className={styles.featureText}>Carefully selected products and finishing.</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>
              <i className="fa-solid fa-headset" />
            </span>
            <div>
              <p className={styles.featureTitle}>Responsive Support</p>
              <p className={styles.featureText}>We are here to help before and after purchase.</p>
            </div>
          </div>
        </div>

        {/* =========================
           BOTTOM
        ========================= */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {year} Exuberance. All rights reserved.
          </p>

          <div className={styles.bottomLinks}>
            <Link href="/privacy-policy" className={styles.bottomLink}>
              Privacy
            </Link>
            <Link href="/terms-and-conditions" className={styles.bottomLink}>
              Terms
            </Link>
            <Link href="/order-track" className={styles.bottomLink}>
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
