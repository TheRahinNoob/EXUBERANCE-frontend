import type { Metadata } from "next";
import Link from "next/link";
import styles from "./PrivacyPolicyPage.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Privacy Policy of Exuberance to understand how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      {/* =========================
         HERO
      ========================= */}
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <span className={styles.eyebrow}>Privacy Policy</span>
          <h1 className={styles.title}>Your privacy matters to Exuberance.</h1>
          <p className={styles.subtitle}>
            This Privacy Policy explains, in general terms, how Exuberance may
            collect, use, and protect information when you browse our website,
            place orders, or contact us.
          </p>

          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.primaryBtn}>
              Shop Now
            </Link>
            <Link href="/contact" className={styles.secondaryBtn}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
         POLICY CONTENT
      ========================= */}
      <section className={styles.section}>
        <div className={styles.layout}>
          {/* LEFT SIDEBAR */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarLabel}>Quick Overview</p>
              <ul className={styles.sidebarList}>
                <li>Information we collect</li>
                <li>How we use information</li>
                <li>Order and support communication</li>
                <li>Cookies and analytics</li>
                <li>Data security</li>
                <li>Your choices</li>
              </ul>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className={styles.content}>
            <div className={styles.contentCard}>
              <p className={styles.lastUpdated}>Last updated: March 2026</p>

              <section className={styles.block}>
                <h2 className={styles.heading}>1. Introduction</h2>
                <p className={styles.text}>
                  Exuberance respects your privacy and aims to handle personal
                  information responsibly. This page provides a general overview
                  of how information may be collected and used through our
                  website and related customer interactions.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>2. Information We May Collect</h2>
                <p className={styles.text}>
                  Depending on how you use our website, we may collect basic
                  information such as your name, phone number, email address,
                  shipping address, billing details, and order information.
                </p>
                <p className={styles.text}>
                  We may also collect technical information such as browser
                  type, device information, IP address, pages visited, and
                  general usage activity to help improve the website experience.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>3. How We Use Information</h2>
                <p className={styles.text}>
                  We may use information to process orders, deliver products,
                  respond to customer support requests, improve website
                  performance, prevent misuse, and communicate relevant updates
                  regarding your orders or account activity.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>4. Order Processing and Communication</h2>
                <p className={styles.text}>
                  When you place an order, your information may be used to
                  confirm purchases, arrange delivery, provide tracking-related
                  communication, and resolve issues related to payment, returns,
                  or customer support.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>5. Cookies and Analytics</h2>
                <p className={styles.text}>
                  Our website may use cookies, pixels, and similar technologies
                  to remember preferences, improve functionality, analyze
                  performance, and understand how visitors interact with the
                  site.
                </p>
                <p className={styles.text}>
                  These tools may help us improve navigation, product discovery,
                  and marketing effectiveness, while keeping the user experience
                  smoother and more relevant.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>6. Information Sharing</h2>
                <p className={styles.text}>
                  Exuberance may share limited information with trusted service
                  providers only when necessary for business operations, such as
                  payment processing, delivery, website hosting, analytics, or
                  customer support. We do not intend to sell personal
                  information as part of normal business operations.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>7. Data Security</h2>
                <p className={styles.text}>
                  We aim to use reasonable technical and organizational measures
                  to protect information from unauthorized access, loss, misuse,
                  or disclosure. However, no online system can guarantee
                  absolute security.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>8. Your Choices</h2>
                <p className={styles.text}>
                  You may choose not to provide certain information, although
                  this may affect your ability to use some services or complete
                  orders. You may also contact us if you want to ask about your
                  information or request corrections where applicable.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>9. Third-Party Links</h2>
                <p className={styles.text}>
                  Our website may contain links to third-party websites or
                  services. We are not responsible for the privacy practices or
                  content of those external sites.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>10. Policy Updates</h2>
                <p className={styles.text}>
                  Exuberance may update this Privacy Policy from time to time to
                  reflect operational, legal, or service-related changes. Any
                  updated version will be posted on this page.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>11. Contact</h2>
                <p className={styles.text}>
                  If you have questions about this Privacy Policy or how your
                  information may be handled, please contact us through our
                  official support channels.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
