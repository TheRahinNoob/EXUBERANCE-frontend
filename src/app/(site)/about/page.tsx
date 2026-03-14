import type { Metadata } from "next";
import Link from "next/link";
import styles from "./AboutPage.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Exuberance — a modern lifestyle and fashion brand focused on quality, comfort, and everyday style.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      {/* =========================
         HERO
      ========================= */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>About Exuberance</span>

          <h1 className={styles.title}>
            Designed for everyday confidence, comfort, and clean style.
          </h1>

          <p className={styles.subtitle}>
            Exuberance is a modern lifestyle and fashion brand focused on
            timeless design, quality materials, and a smooth shopping
            experience. We believe good style should feel effortless, refined,
            and wearable every day.
          </p>

          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.primaryBtn}>
              Shop Now
            </Link>
            <Link href="/order-track" className={styles.secondaryBtn}>
              Track Order
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
         STORY
      ========================= */}
      <section className={styles.section}>
        <div className={styles.gridTwo}>
          <div className={styles.cardLarge}>
            <span className={styles.sectionTag}>Our Story</span>
            <h2 className={styles.sectionTitle}>Simple products. Better presence.</h2>
            <p className={styles.text}>
              Exuberance was built with a simple idea: everyday essentials
              should look elevated, feel comfortable, and fit naturally into
              modern life. Instead of chasing noise, we focus on clean design,
              balanced detail, and pieces that remain relevant beyond trends.
            </p>
            <p className={styles.text}>
              Our goal is to offer products that feel polished without being
              complicated — items you can wear, gift, and enjoy with confidence.
            </p>
          </div>

          <div className={styles.stack}>
            <div className={styles.infoCard}>
              <span className={styles.infoNumber}>01</span>
              <h3 className={styles.infoTitle}>Quality First</h3>
              <p className={styles.infoText}>
                We value materials, finishing, and details that make products
                feel dependable and premium.
              </p>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoNumber}>02</span>
              <h3 className={styles.infoTitle}>Everyday Wearability</h3>
              <p className={styles.infoText}>
                Our approach is practical style — easy to wear, easy to pair,
                and suitable for daily life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
         VALUES
      ========================= */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTag}>What We Value</span>
          <h2 className={styles.sectionTitleCentered}>
            A brand shaped by clarity, consistency, and care.
          </h2>
        </div>

        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <i className="fa-solid fa-shirt" />
            </div>
            <h3 className={styles.valueTitle}>Thoughtful Design</h3>
            <p className={styles.valueText}>
              Clean silhouettes, refined details, and a modern aesthetic that
              stays versatile.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <i className="fa-solid fa-gem" />
            </div>
            <h3 className={styles.valueTitle}>Reliable Quality</h3>
            <p className={styles.valueText}>
              We aim for products that feel durable, well-made, and satisfying
              to own.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <i className="fa-solid fa-heart" />
            </div>
            <h3 className={styles.valueTitle}>Customer Focus</h3>
            <p className={styles.valueText}>
              From browsing to delivery, we want the experience to feel smooth,
              clear, and trustworthy.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
         HIGHLIGHT STRIP
      ========================= */}
      <section className={styles.section}>
        <div className={styles.highlightWrap}>
          <div className={styles.highlightCard}>
            <p className={styles.highlightNumber}>Premium</p>
            <p className={styles.highlightLabel}>look & feel</p>
          </div>

          <div className={styles.highlightCard}>
            <p className={styles.highlightNumber}>Modern</p>
            <p className={styles.highlightLabel}>everyday styling</p>
          </div>

          <div className={styles.highlightCard}>
            <p className={styles.highlightNumber}>Smooth</p>
            <p className={styles.highlightLabel}>shopping experience</p>
          </div>
        </div>
      </section>

      {/* =========================
         CTA
      ========================= */}
      <section className={styles.section}>
        <div className={styles.cta}>
          <span className={styles.sectionTag}>Explore Exuberance</span>
          <h2 className={styles.ctaTitle}>
            Discover pieces made for everyday confidence.
          </h2>
          <p className={styles.ctaText}>
            Browse our collection and experience a cleaner, more refined take on
            lifestyle and fashion essentials.
          </p>

          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.primaryBtn}>
              Explore Collection
            </Link>
            <Link href="/contact" className={styles.secondaryBtn}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
