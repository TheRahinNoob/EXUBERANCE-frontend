"use client";

import { useState } from "react";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import styles from "./OrderTrack.module.css";

/* ==================================================
   Types (API Contract)
================================================== */
type OrderItem = {
  product_name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
};

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type Order = {
  reference: string;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  items: OrderItem[];
};

/* ==================================================
   Helpers
================================================== */
function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

/* ==================================================
   Page
================================================== */
export default function TrackOrderPage() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ==================================================
     Fetch Order
  ================================================== */
  async function handleTrack() {
    setError(null);
    setOrder(null);

    if (!reference || !phone) {
      setError("Please enter both order reference and phone number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/orders/track/?reference=${reference}&phone=${phone}`,
        { cache: "no-store" }
      );

      const raw = await res.text();

      if (!res.ok) {
        throw new Error(parseError(raw));
      }

      setOrder(JSON.parse(raw));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch order details."
      );
    } finally {
      setLoading(false);
    }
  }

  function parseError(raw: string): string {
    try {
      const data = JSON.parse(raw);
      if (typeof data?.detail === "string") {
        return data.detail;
      }
    } catch {}
    return "Order not found. Please verify your details.";
  }

  /* ==================================================
     UI
  ================================================== */
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Track Your Order</h1>

      {/* ================= INPUT CARD ================= */}
      <section className={styles.inputCard}>
        <input
          placeholder="Order Reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button onClick={handleTrack} disabled={loading}>
          {loading ? "Checking…" : "Track Order"}
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </section>

      {/* ================= ORDER RESULT ================= */}
      {order && (
        <>
          {/* HEADER */}
          <section className={styles.orderHeader}>
            <h2>{order.reference}</h2>
            <p>Placed on {formatDate(order.created_at)}</p>
          </section>

          {/* STATUS TIMELINE */}
          <OrderStatusTimeline status={order.status} />

          {/* ITEMS */}
          <section className={styles.itemsCard}>
            <h3>Order Items</h3>

            {order.items.map((item, idx) => (
              <div key={idx} className={styles.item}>
                <strong>{item.product_name}</strong>
                <div className={styles.variant}>
                  Size: {item.size} | Color: {item.color}
                </div>
                <div className={styles.price}>
                  ৳ {item.price} × {item.quantity}
                </div>
              </div>
            ))}

            <div className={styles.total}>
              Total: ৳ {order.total_price}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
