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

type OrderDetailResponse = {
  reference: string;
  total: number;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
};

/* ==================================================
   Order Success Client - Production Ready
================================================== */
export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("ref");

  const [copied, setCopied] = useState(false);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /* -----------------------------
     SAFETY: Redirect if no reference
  ----------------------------- */
  useEffect(() => {
    if (!reference) router.replace("/");
  }, [reference, router]);

  /* -----------------------------
     Fire Meta Purchase Event (deduplicated)
  ----------------------------- */
  useEffect(() => {
    if (!reference || typeof window === "undefined" || !(window as any).fbq) return;

    const firedKey = `meta_purchase_fired_${reference}`;
    if (sessionStorage.getItem(firedKey)) return;

    const firePurchase = (metaUser: MetaUserData) => {
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
            fn: metaUser.fn,
            ln: metaUser.ln,
            em: metaUser.em,
            ph: metaUser.ph,
            ct: metaUser.ct,
            country: "bd",
          }
        );
        sessionStorage.setItem(firedKey, "1");
        console.log(`[Meta Pixel] Purchase fired for reference ${reference}`);
      } catch (err) {
        console.error("[Meta Pixel] Purchase error:", err);
      }
    };

    // 1️⃣ Use sessionStorage first
    const rawMeta = sessionStorage.getItem("meta_user_data");
    if (rawMeta) {
      const metaUser: MetaUserData = JSON.parse(rawMeta);
      setOrderTotal(metaUser.total ?? null);
      firePurchase(metaUser);
      sessionStorage.removeItem("meta_user_data");
      setLoading(false);
      return;
    }

    // 2️⃣ Fallback: fetch order from frontend API route
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(reference)}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data: OrderDetailResponse = await res.json();

        setOrderTotal(data.total ?? null);

        const [fn, ...rest] = data.name?.trim().split(" ") || [];
        const ln = rest.join(" ");

        const metaUser: MetaUserData = {
          fn: fn || undefined,
          ln: ln || undefined,
          em: data.email || undefined,
          ph: data.phone,
          ct: data.city,
          total: data.total,
        };

        firePurchase(metaUser);
      } catch (err) {
        console.error("[OrderSuccessClient] Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [reference]);

  /* -----------------------------
     COPY ORDER REFERENCE
  ----------------------------- */
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
            <button
              type="button"
              onClick={copyReference}
              aria-label="Copy order reference"
            >
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
