import type { Metadata } from "next";
import Link from "next/link";
import styles from "./TermsPage.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the Terms & Conditions of Exuberance regarding website use, orders, payments, shipping, returns, and general policies.",
};

export default function TermsAndConditionsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <span className={styles.eyebrow}>Terms &amp; Conditions</span>
          <h1 className={styles.title}>
            Clear terms for a smoother shopping experience.
          </h1>
          <p className={styles.subtitle}>
            These Terms &amp; Conditions provide a general overview of the rules,
            expectations, and policies that may apply when using the Exuberance
            website and placing orders through our store.
          </p>

          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.primaryBtn}>
              Shop Now
            </Link>
            <Link href="/privacy-policy" className={styles.secondaryBtn}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarLabel}>Quick Overview</p>
              <ul className={styles.sidebarList}>
                <li>Website use</li>
                <li>Products and pricing</li>
                <li>Orders and payment</li>
                <li>Shipping and delivery</li>
                <li>Returns and cancellations</li>
                <li>Liability and updates</li>
              </ul>
            </div>
          </aside>

          <div className={styles.content}>
            <div className={styles.contentCard}>
              <p className={styles.lastUpdated}>Last updated: March 2026</p>

              <section className={styles.block}>
                <h2 className={styles.heading}>1. Introduction</h2>
                <p className={styles.text}>
                  Welcome to Exuberance. By accessing or using our website, you
                  agree to these Terms &amp; Conditions in a general sense. These
                  terms are intended to explain the basic rules that apply to
                  browsing the site, placing orders, and interacting with our
                  services.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>2. Use of the Website</h2>
                <p className={styles.text}>
                  You agree to use this website in a lawful and respectful
                  manner. Any misuse of the site, including fraudulent activity,
                  interference with normal operations, or attempts to harm the
                  platform, may result in restricted access or cancellation of
                  services.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>3. Product Information</h2>
                <p className={styles.text}>
                  We aim to present product descriptions, images, pricing, and
                  availability as accurately as possible. However, minor
                  differences in color, appearance, packaging, or product detail
                  may occur depending on screens, updates, or manufacturing
                  changes.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>4. Pricing and Availability</h2>
                <p className={styles.text}>
                  Prices and availability may change without prior notice. While
                  we try to keep all information current, there may occasionally
                  be errors related to stock, pricing, or display content. In
                  such cases, Exuberance reserves the right to correct the issue
                  and, where necessary, cancel or adjust affected orders.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>5. Orders</h2>
                <p className={styles.text}>
                  Placing an order does not always guarantee final acceptance.
                  Orders may be reviewed for availability, verification,
                  delivery feasibility, or payment confirmation. Exuberance may
                  decline or cancel orders when reasonably necessary.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>6. Payment</h2>
                <p className={styles.text}>
                  Customers are expected to provide accurate payment and billing
                  information when completing a purchase. Orders may only be
                  processed after successful payment confirmation or according to
                  the payment method offered on the site.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>7. Shipping and Delivery</h2>
                <p className={styles.text}>
                  Delivery timelines may vary depending on location, courier
                  operations, stock handling, public holidays, or other external
                  conditions. Estimated delivery times are provided for
                  convenience and should not always be treated as absolute
                  guarantees.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>8. Returns, Exchanges, and Cancellations</h2>
                <p className={styles.text}>
                  Return, exchange, and cancellation requests may be accepted
                  according to our store policies and the condition of the
                  product. Products may need to be unused, undamaged, and
                  returned within an applicable timeframe where such requests are
                  allowed.
                </p>
                <p className={styles.text}>
                  Certain items may be non-returnable depending on product type,
                  hygiene concerns, custom handling, or promotional conditions.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>9. User Information</h2>
                <p className={styles.text}>
                  You are responsible for providing accurate personal, shipping,
                  and contact information when using our services. Incorrect or
                  incomplete information may affect delivery, communication, or
                  order fulfillment.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>10. Intellectual Property</h2>
                <p className={styles.text}>
                  Content on the Exuberance website, including branding, logos,
                  design elements, text, graphics, and product presentation, may
                  be protected by applicable intellectual property rights and
                  should not be copied, reused, or redistributed without proper
                  permission.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>11. Third-Party Services</h2>
                <p className={styles.text}>
                  Some parts of the website or business process may involve
                  third-party tools or service providers, such as payment,
                  analytics, shipping, or communication platforms. Exuberance is
                  not responsible for the independent policies or actions of
                  third-party services outside our direct control.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>12. Limitation of Liability</h2>
                <p className={styles.text}>
                  Exuberance aims to provide a reliable shopping experience, but
                  we do not guarantee that the website will always be
                  uninterrupted, error-free, or completely free of technical
                  issues. To the extent generally applicable, Exuberance shall
                  not be responsible for indirect or incidental losses arising
                  from use of the site or related services.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>13. Policy Changes</h2>
                <p className={styles.text}>
                  These Terms &amp; Conditions may be updated from time to time to
                  reflect operational, legal, or business changes. Any revised
                  version may be published on this page.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>14. Contact</h2>
                <p className={styles.text}>
                  If you have questions about these Terms &amp; Conditions, you may
                  contact Exuberance through the official support channels
                  listed on the website.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
