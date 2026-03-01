"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "./OrderSuccess.module.css";

type MetaUserData = {
  total?: number;
};

type OrderDetailResponse = {
  reference: string;
  subtotal?: number;
  delivery_charge?: number;
  total_price: number;
  currency?: string;
};

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("ref");

  const [copied, setCopied] = useState(false);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if no reference
  useEffect(() => {
    if (!reference) router.replace("/");
  }, [reference, router]);

  // Fire Meta Pixel Purchase (deduplicated)
  useEffect(() => {
    // If ref missing, do nothing (redirect effect will run)
    if (!reference) return;

    // If fbq not available, still try to fetch total for UI
    const hasFbq = typeof window !== "undefined" && Boolean((window as any).fbq);

    const firedKey = `meta_purchase_fired_${reference}`;

    const firePurchase = (metaUser: MetaUserData) => {
      if (!hasFbq) return;

      // Deduplicate
      if (sessionStorage.getItem(firedKey)) return;

      try {
        (window as any).fbq(
          "track",
          "Purchase",
          {
            value: metaUser.total ?? 0,
            currency: "BDT",
            content_name: "Checkout Form",
          },
          {
            external_id: reference,
            country: "bd",
          }
        );

        sessionStorage.setItem(firedKey, "1");
        // console.log(`[Meta Pixel] Purchase fired for reference ${reference}`);
      } catch (err) {
        console.error("[Meta Pixel] Purchase error:", err);
      }
    };

    // 1) Check sessionStorage first (if your checkout saved it)
    const rawMeta = sessionStorage.getItem("meta_user_data");
    if (rawMeta) {
      try {
        const metaUser: MetaUserData = JSON.parse(rawMeta);
        setOrderTotal(metaUser.total ?? null);
        firePurchase(metaUser);
      } catch (err) {
        console.error("[OrderSuccessClient] meta_user_data parse error:", err);
      } finally {
        sessionStorage.removeItem("meta_user_data");
        setLoading(false);
      }
      return;
    }

    // 2) Fallback: fetch order total from backend (public endpoint returns NO PII)
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `/api/orders/public/by-ref/${encodeURIComponent(reference)}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(`Failed to fetch order (${res.status})`);

        const data: OrderDetailResponse = await res.json();

        setOrderTotal(data.total_price ?? null);
        firePurchase({ total: data.total_price });
      } catch (err) {
        console.error("[OrderSuccessClient] Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [reference]);

  // Copy order reference
  const copyReference = useCallback(async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
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
            <button type="button" onClick={copyReference} aria-label="Copy order reference">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {loading ? (
          <p className={styles.loading}>Loading order details…</p>
        ) : orderTotal !== null ? (
          <p className={styles.total}>Order Total: ৳ {orderTotal}</p>
        ) : (
          <p className={styles.error}>Failed to load order total.</p>
        )}

        <div className={styles.nextSteps}>
          <h3>What happens next?</h3>
          <ul>
            <li>We verify your order</li>
            <li>You receive a confirmation call</li>
            <li>Your order is prepared and shipped</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href={`/order-track?ref=${encodeURIComponent(reference)}`} className={styles.primaryBtn}>
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