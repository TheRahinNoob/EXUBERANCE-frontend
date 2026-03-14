import type { Metadata } from "next";
import Link from "next/link";
import styles from "./ShippingReturnsPage.module.css";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Learn about Exuberance shipping, delivery, returns, exchanges, cancellations, and general order support policies.",
};

export default function ShippingAndReturnsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <span className={styles.eyebrow}>Shipping &amp; Returns</span>

          <h1 className={styles.title}>
            Simple policies for delivery, returns, and order support.
          </h1>

          <p className={styles.subtitle}>
            This page gives a general overview of how shipping, delivery,
            returns, exchanges, and cancellations may work at Exuberance.
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

      <section className={styles.section}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarLabel}>Quick Overview</p>
              <ul className={styles.sidebarList}>
                <li>Order processing</li>
                <li>Delivery timing</li>
                <li>Shipping details</li>
                <li>Returns and exchanges</li>
                <li>Cancellations</li>
                <li>Support</li>
              </ul>
            </div>
          </aside>

          <div className={styles.content}>
            <div className={styles.contentCard}>
              <p className={styles.lastUpdated}>Last updated: March 2026</p>

              <section className={styles.block}>
                <h2 className={styles.heading}>1. Order Processing</h2>
                <p className={styles.text}>
                  Orders are generally processed after successful confirmation
                  of purchase and necessary order details. Processing time may
                  vary depending on stock availability, order volume, weekends,
                  holidays, or special situations.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>2. Shipping and Delivery</h2>
                <p className={styles.text}>
                  Exuberance aims to arrange delivery in a timely manner.
                  Delivery speed may depend on your location, courier
                  availability, weather conditions, holidays, or other logistics
                  factors outside direct control.
                </p>
                <p className={styles.text}>
                  Estimated delivery times are provided for convenience and may
                  change if operational conditions require it.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>3. Shipping Information</h2>
                <p className={styles.text}>
                  Customers should provide accurate shipping details, including
                  recipient name, phone number, and complete address. Incorrect
                  or incomplete information may delay delivery or cause order
                  issues.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>4. Delivery Attempts</h2>
                <p className={styles.text}>
                  Courier providers may attempt delivery according to their own
                  operational process. If a customer is unavailable, additional
                  coordination, delay, or reattempt procedures may apply
                  depending on the delivery partner.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>5. Order Tracking</h2>
                <p className={styles.text}>
                  Customers may use the Track Order page, where available, to
                  review the status of their shipment. Tracking updates depend
                  on the courier or order system currently in use.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>6. Returns</h2>
                <p className={styles.text}>
                  Return requests may be accepted according to the store&apos;s
                  policy and the condition of the product. In general, returned
                  items should remain unused, undamaged, and in an acceptable
                  return condition with original packaging where applicable.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>7. Exchanges</h2>
                <p className={styles.text}>
                  Exchanges may be considered for eligible products, subject to
                  stock availability and product condition. Exchange approval
                  may depend on the nature of the request and the specific item
                  involved.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>8. Non-Returnable Items</h2>
                <p className={styles.text}>
                  Some items may not be eligible for return or exchange,
                  depending on product type, hygiene concerns, clearance status,
                  custom handling, or other policy-based reasons.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>9. Cancellations</h2>
                <p className={styles.text}>
                  Order cancellations may be possible before an order has been
                  fully processed or dispatched. Once shipping has progressed,
                  cancellation may no longer be available or may need to follow
                  a return process instead.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>10. Damaged or Incorrect Items</h2>
                <p className={styles.text}>
                  If you receive a damaged, defective, or incorrect item, please
                  contact support as soon as possible with your order details so
                  the issue can be reviewed and handled appropriately.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>11. Refund Handling</h2>
                <p className={styles.text}>
                  Where refunds are applicable, processing time may vary
                  depending on order review, payment method, and internal or
                  partner processing timelines.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>12. Policy Updates</h2>
                <p className={styles.text}>
                  Exuberance may update shipping and return policies from time
                  to time to reflect changes in business operations, delivery
                  partners, or service requirements. Updated information may be
                  posted on this page.
                </p>
              </section>

              <section className={styles.block}>
                <h2 className={styles.heading}>13. Need Help?</h2>
                <p className={styles.text}>
                  If you have questions about shipping, delivery, returns,
                  exchanges, or cancellations, please contact Exuberance
                  through the official support channels available on the
                  website.
                </p>
              </section>

              <div className={styles.ctaRow}>
                <Link href="/order-track" className={styles.primaryBtn}>
                  Track Your Order
                </Link>

                <Link href="/contact" className={styles.secondaryBtn}>
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
