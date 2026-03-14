import type { Metadata } from "next";
import Link from "next/link";
import styles from "./FaqPage.module.css";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Find answers to common questions about orders, delivery, returns, payments, and shopping with Exuberance.",
};

const faqItems = [
  {
    question: "How do I place an order?",
    answer:
      "Browse the products, choose your preferred size or color if available, add the item to your cart, and complete checkout with your delivery details.",
  },
  {
    question: "How can I track my order?",
    answer:
      "You can use the Track Order page on our website to check the latest status of your order.",
  },
  {
    question: "How long does delivery usually take?",
    answer:
      "Delivery time may vary depending on your location, courier operations, weekends, holidays, and product availability. Estimated times may change when needed.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Order cancellation may be possible before the order is processed or dispatched. Please contact support as soon as possible if you need help with cancellation.",
  },
  {
    question: "Do you offer returns or exchanges?",
    answer:
      "Returns or exchanges may be available depending on the product condition and your store policy. Items usually need to remain unused and in acceptable condition.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Available payment methods depend on your current checkout setup. Customers should use the payment options shown during checkout.",
  },
  {
    question: "What if I receive the wrong or damaged item?",
    answer:
      "If you receive an incorrect or damaged product, contact support with your order details as soon as possible so the issue can be reviewed.",
  },
  {
    question: "Do I need an account to order?",
    answer:
      "If your store allows guest checkout, an account may not be required. Otherwise, follow the checkout process shown on the website.",
  },
  {
    question: "Why is a product showing out of stock?",
    answer:
      "Some products or variants may become unavailable when inventory runs low or sells out. Stock can change as orders are placed.",
  },
  {
    question: "How can I contact Exuberance?",
    answer:
      "You can contact Exuberance through the official support or contact channels provided on the website.",
  },
];

export default function FaqPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <span className={styles.eyebrow}>FAQ</span>
          <h1 className={styles.title}>
            Answers to common questions, made simple.
          </h1>
          <p className={styles.subtitle}>
            Find quick answers about shopping, orders, delivery, returns, and
            general support at Exuberance.
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

      <section className={styles.section}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarLabel}>Quick Topics</p>
              <ul className={styles.sidebarList}>
                <li>Orders</li>
                <li>Tracking</li>
                <li>Delivery</li>
                <li>Returns</li>
                <li>Payments</li>
                <li>Support</li>
              </ul>
            </div>
          </aside>

          <div className={styles.content}>
            <div className={styles.contentCard}>
              <p className={styles.intro}>
                Below are some of the most common questions customers may have
                while shopping with Exuberance.
              </p>

              <div className={styles.faqList}>
                {faqItems.map((item) => (
                  <details key={item.question} className={styles.faqItem}>
                    <summary className={styles.question}>
                      <span>{item.question}</span>
                    </summary>
                    <p className={styles.answer}>{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
