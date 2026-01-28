"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./OrderSuccess.module.css";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("ref");

  /* ----------------------------------
     SAFETY GUARD
  ---------------------------------- */
  useEffect(() => {
    if (!reference) {
      router.replace("/");
    }
  }, [reference, router]);

  if (!reference) {
    return (
      <main className={styles.wrapper}>
        <p className={styles.loading}>Redirecting…</p>
      </main>
    );
  }

  function copyReference() {
    navigator.clipboard.writeText(reference);
  }

  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        {/* HEADER */}
        <h1 className={styles.title}>🎉 Order Placed Successfully</h1>
        <p className={styles.subtitle}>
          Thank you for shopping with us. Your order has been received.
        </p>

        {/* REFERENCE */}
        <div className={styles.referenceBox}>
          <span className={styles.label}>Order Reference</span>
          <div className={styles.referenceRow}>
            <strong>{reference}</strong>
            <button onClick={copyReference}>Copy</button>
          </div>
        </div>

        {/* NEXT STEPS */}
        <div className={styles.nextSteps}>
          <h3>What happens next?</h3>
          <ul>
            <li>We verify your order</li>
            <li>You receive a confirmation call</li>
            <li>Your order is prepared and shipped</li>
          </ul>
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <Link
            href={`/order-track?ref=${reference}`}
            className={styles.primaryBtn}
          >
            Track Order
          </Link>

          <Link href="/" className={styles.secondaryBtn}>
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
