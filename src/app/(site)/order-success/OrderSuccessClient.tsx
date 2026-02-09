"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "./OrderSuccess.module.css";

type MetaUserData = {
  fn?: string;
  ln?: string;
  em?: string;
  ph?: string;
  ct?: string;
  total?: number;
};

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("ref");
  const [copied, setCopied] = useState(false);

  /* ==================================================
     SAFETY GUARD — INVALID ACCESS
  ================================================== */
  useEffect(() => {
    if (!reference) router.replace("/");
  }, [reference, router]);

  /* ==================================================
     META — PURCHASE (ADVANCED MATCHING, ONCE)
  ================================================== */
  useEffect(() => {
    if (!reference || typeof window === "undefined" || !(window as any).fbq)
      return;

    const firedKey = `meta_purchase_fired_${reference}`;
    if (sessionStorage.getItem(firedKey)) return;

    // Load saved checkout data
    const rawMeta = sessionStorage.getItem("meta_user_data");
    const metaUser: MetaUserData | null = rawMeta ? JSON.parse(rawMeta) : null;

    // Mark this order as fired
    sessionStorage.setItem(firedKey, "1");

    // Fire the Purchase event
    (window as any).fbq(
      "track",
      "Purchase",
      {
        value: metaUser?.total ?? 0.0, // ✅ Real order total
        currency: "BDT",
        content_name: "Checkout Form",
      },
      {
        external_id: reference, // strongest dedupe key
        fn: metaUser?.fn,
        ln: metaUser?.ln,
        em: metaUser?.em,
        ph: metaUser?.ph,
        ct: metaUser?.ct,
        country: "bd",
      }
    );

    // Cleanup stored data (optional)
    sessionStorage.removeItem("meta_user_data");
  }, [reference]);

  /* ==================================================
     COPY ORDER REFERENCE
  ================================================== */
  const copyReference = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reference || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Failed to copy order reference");
    }
  }, [reference]);

  if (!reference) {
    return (
      <main className={styles.wrapper}>
        <p className={styles.loading}>Redirecting…</p>
      </main>
    );
  }

  /* ==================================================
     RENDER
  ================================================== */
  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>🎉 Order Placed Successfully</h1>

        <p className={styles.subtitle}>
          Thank you for shopping with us. Your order has been received.
        </p>

        <div className={styles.referenceBox}>
          <span className={styles.label}>Order Reference</span>
          <div className={styles.referenceRow}>
            <strong className={styles.mono}>{reference}</strong>
            <button
              type="button"
              onClick={copyReference}
              aria-label="Copy order reference"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className={styles.nextSteps}>
          <h3>What happens next?</h3>
          <ul>
            <li>We verify your order</li>
            <li>You receive a confirmation call</li>
            <li>Your order is prepared and shipped</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link
            href={`/order-track?ref=${encodeURIComponent(reference)}`}
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
