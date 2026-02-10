"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import styles from "./CheckoutPage.module.css";

type CheckoutItemPayload = { variant_id: number; quantity: number };
type OrderSuccessResponse = { reference: string; status: string };
type CheckoutState = "idle" | "submitting" | "failed";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/* ==================================================
   BANGLADESH DISTRICTS
================================================== */
const BD_CITIES = [
  "Dhaka","Chattogram","Sylhet","Khulna","Rajshahi",
  "Barishal","Rangpur","Mymensingh","Cumilla","Narayanganj",
  "Gazipur","Bogura","Jessore",
];

/* ==================================================
   COMPONENT
================================================== */
export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const clearCart = useCartStore((s) => s.clearCart);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------
     Empty cart guard
  ----------------------------- */
  if (!items.length) {
    return (
      <main className={styles.empty}>
        <h1>Your cart is empty</h1>
        <Link href="/" className={styles.backLink}>
          Return to shop
        </Link>
      </main>
    );
  }

  /* ==================================================
     PLACE ORDER
  ================================================== */
  const handlePlaceOrder = async () => {
    if (state === "submitting") return;

    // Validation
    if (!fullName || !phone || !address || !city) {
      setError("Please fill in all required fields.");
      return;
    }

    setState("submitting");
    setError(null);

    try {
      // Payload for backend
      const payload = {
        name: fullName,
        email,
        phone,
        alt_phone: altPhone,
        address,
        city,
        note,
        items: items.map<CheckoutItemPayload>((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch(`${API_BASE}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(raw);

      const data: OrderSuccessResponse = JSON.parse(raw);

      // -------------------------------
      // Meta Pixel InitiateCheckout
      // -------------------------------
      const [fn, ...rest] = fullName.trim().split(" ");
      const ln = rest.join(" ");

      const metaData = {
        fn: fn || undefined,
        ln: ln || undefined,
        em: email || undefined,
        ph: phone,
        ct: city,
        total: totalPrice,
      };

      sessionStorage.setItem("meta_user_data", JSON.stringify(metaData));

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq(
          "track",
          "InitiateCheckout",
          {
            value: totalPrice,
            currency: "BDT",
            content_name: "Checkout Form",
          },
          {
            ...metaData,
            ad: address,
            country: "bd",
          }
        );
      }

      // -------------------------------
      // Clear cart
      // -------------------------------
      clearCart();

      // -------------------------------
      // Clear AddToCart deduplication keys
      // -------------------------------
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("addToCartFired-"))
        .forEach((k) => sessionStorage.removeItem(k));

      // Redirect to order success page
      router.replace(`/order-success?ref=${data.reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed.");
      setState("failed");
    }
  };

  /* ==================================================
     RENDER
  ================================================== */
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.layout}>
        {/* Customer Info */}
        <section className={styles.section}>
          <h2>Customer Information</h2>

          <input className={styles.input} placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className={styles.input} placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={styles.input} placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className={styles.input} placeholder="Alternative Phone (optional)" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
          <textarea className={styles.textarea} placeholder="Detailed Address *" value={address} onChange={(e) => setAddress(e.target.value)} />
          <select className={styles.input} value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Select City / District *</option>
            {BD_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea className={styles.textarea} placeholder="Delivery Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />

          {error && <p className={styles.error}>{error}</p>}
        </section>

        {/* Order Summary */}
        <aside className={styles.summaryWrapper}>
          <div className={styles.summary}>
            <h2>Order Summary</h2>
            {items.map((item) => (
              <div key={item.variant_id} className={styles.item}>
                <span>{item.product_name} ({item.variant_label}) × {item.quantity}</span>
                <span>৳ {item.price * item.quantity}</span>
              </div>
            ))}
            <div className={styles.total}>Total: ৳ {totalPrice}</div>
            <button className={styles.button} disabled={state === "submitting"} onClick={handlePlaceOrder}>
              {state === "submitting" ? "Placing Order…" : "Place Order"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
