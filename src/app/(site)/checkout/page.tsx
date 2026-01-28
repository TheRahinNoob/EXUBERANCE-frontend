"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import styles from "./CheckoutPage.module.css";

/* ==================================================
   TYPES
================================================== */
type CheckoutItemPayload = {
  variant_id: number;
  quantity: number;
};

type OrderSuccessResponse = {
  reference: string;
  status: string;
};

type CheckoutState = "idle" | "submitting" | "failed";

/* ==================================================
   CONFIG
================================================== */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

/* ==================================================
   PAGE
================================================== */
export default function CheckoutPage() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const clearCart = useCartStore((s) => s.clearCart);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [state, setState] =
    useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <main className={styles.empty}>
        <h1>Your cart is empty</h1>
        <Link href="/">Return to shop</Link>
      </main>
    );
  }

  async function handlePlaceOrder() {
    if (state === "submitting") return;

    if (!name || !phone || !address) {
      setError("Please fill in all required fields.");
      return;
    }

    setState("submitting");
    setError(null);

    try {
      const payload = {
        name,
        phone,
        address,
        items: items.map<CheckoutItemPayload>(
          (item) => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
          })
        ),
      };

      const res = await fetch(
        `${API_BASE}/api/orders/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const raw = await res.text();
      if (!res.ok) throw new Error(raw);

      const data: OrderSuccessResponse =
        JSON.parse(raw);

      clearCart();
      router.replace(
        `/order-success?ref=${data.reference}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Order failed."
      );
      setState("failed");
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.layout}>
        {/* CUSTOMER INFO */}
        <section className={styles.section}>
          <h2>Customer Information</h2>

          <input
            className={styles.input}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <textarea
            className={styles.textarea}
            placeholder="Delivery Address"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
          />

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}
        </section>

        {/* ORDER SUMMARY */}
        <aside className={styles.summary}>
          <h2>Order Summary</h2>

          {items.map((item) => (
            <div
              key={item.variant_id}
              className={styles.item}
            >
              <span>
                {item.product_name} (
                {item.variant_label}) ×{" "}
                {item.quantity}
              </span>
              <span>
                ৳ {item.price * item.quantity}
              </span>
            </div>
          ))}

          <div className={styles.total}>
            Total: ৳ {totalPrice}
          </div>

          <button
            className={styles.button}
            disabled={state === "submitting"}
            onClick={handlePlaceOrder}
          >
            {state === "submitting"
              ? "Placing Order…"
              : "Place Order"}
          </button>
        </aside>
      </div>
    </main>
  );
}
