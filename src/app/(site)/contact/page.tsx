import type { Metadata } from "next";
import Link from "next/link";
import styles from "./ContactPage.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Exuberance through WhatsApp for order support, product questions, and general assistance.",
};

const WHATSAPP_NUMBER = "8801703572458";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <span className={styles.eyebrow}>Contact Us</span>

          <h1 className={styles.title}>
            Need help? We’re just one message away.
          </h1>

          <p className={styles.subtitle}>
            For order support, product questions, or general help, contact
            Exuberance directly on WhatsApp.
          </p>

          <div className={styles.actions}>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryBtn}
              aria-label="Chat on WhatsApp"
            >
              <i className="fa-brands fa-whatsapp" />
              <span>Chat on WhatsApp</span>
            </a>

            <Link href="/shop" className={styles.secondaryBtn}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.grid}>
          <div className={styles.infoCard}>
            <div className={styles.iconWrap}>
              <i className="fa-brands fa-whatsapp" />
            </div>

            <h2 className={styles.cardTitle}>WhatsApp Support</h2>

            <p className={styles.cardText}>
              Reach out on WhatsApp for quick help regarding orders, delivery,
              product availability, or general support.
            </p>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardLink}
            >
              Open WhatsApp
            </a>
          </div>

          <div className={styles.noteCard}>
            <span className={styles.noteTag}>Support</span>
            <h2 className={styles.noteTitle}>Fast and simple communication.</h2>
            <p className={styles.noteText}>
              We keep contact easy and direct. Message us on WhatsApp and we’ll
              do our best to assist you as smoothly as possible.
            </p>

            <div className={styles.noteActions}>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ghostBtn}
              >
                Message Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
