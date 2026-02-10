"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import styles from "./CheckoutPage.module.css";

type CheckoutItemPayload = { variant_id: number; quantity: number };
type OrderSuccessResponse = { reference: string; status: string; total_price: number };
type CheckoutState = "idle" | "submitting" | "failed";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const BD_CITIES = [
  "Dhaka","Chattogram","Sylhet","Khulna","Rajshahi",
  "Barishal","Rangpur","Mymensingh","Cumilla","Narayanganj",
  "Gazipur","Bogura","Jessore",
];

const DELIVERY_AREAS = [
  { label: "Inside Dhaka (৳80)", value: "inside_dhaka", charge: 80 },
  { label: "Outside Dhaka (৳150)", value: "outside_dhaka", charge: 150 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const cartTotal = useCartStore((s) => s.getTotalPrice());
  const clearCart = useCartStore((s) => s.clearCart);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [note, setNote] = useState("");

  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [backendTotal, setBackendTotal] = useState<number | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);

  // Auto-select delivery area based on city
  useEffect(() => {
    if (!city) return;
    const autoArea = city === "Dhaka" ? "inside_dhaka" : "outside_dhaka";
    setDeliveryArea(autoArea);
  }, [city]);

  // Update delivery charge dynamically
  useEffect(() => {
    const selected = DELIVERY_AREAS.find(d => d.value === deliveryArea);
    setDeliveryCharge(selected?.charge || 0);
  }, [deliveryArea]);

  // Empty cart guard
  if (!items.length) {
    return (
      <main className={styles.emptyCart}>
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <Link href="/" className={styles.backLink}>Return to shop</Link>
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    if (state === "submitting") return;
    if (!fullName || !phone || !address || !city || !deliveryArea) {
      setError("Please fill in all required fields.");
      return;
    }

    setState("submitting");
    setError(null);

    try {
      const payload = {
        name: fullName,
        email,
        phone,
        alt_phone: altPhone,
        address,
        city,
        delivery_area: deliveryArea,
        note,
        items: items.map<CheckoutItemPayload>(i => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch(`${API_BASE}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data: OrderSuccessResponse = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));

      setBackendTotal(data.total_price);

      // Removed Meta Pixel InitiateCheckout code as requested

      clearCart();
      Object.keys(sessionStorage)
        .filter(k => k.startsWith("addToCartFired-"))
        .forEach(k => sessionStorage.removeItem(k));

      router.replace(`/order-success?ref=${data.reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed.");
      setState("failed");
    }
  };

  return (
    <main className={styles.checkoutPage}>
      <h1 className={styles.pageTitle}>Checkout</h1>

      <div className={styles.checkoutContainer}>
        {/* Customer Info */}
        <section className={styles.customerSection}>
          <h2 className={styles.sectionTitle}>Customer Information</h2>

          <input className={styles.inputField} placeholder="Full Name *" value={fullName} onChange={e => setFullName(e.target.value)} />
          <input className={styles.inputField} placeholder="Email (optional)" value={email} onChange={e => setEmail(e.target.value)} />
          <input className={styles.inputField} placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} />
          <input className={styles.inputField} placeholder="Alternative Phone (optional)" value={altPhone} onChange={e => setAltPhone(e.target.value)} />
          <textarea className={styles.textareaField} placeholder="Detailed Address *" value={address} onChange={e => setAddress(e.target.value)} />

          <select className={styles.selectField} value={city} onChange={e => setCity(e.target.value)}>
            <option value="">Select City / District *</option>
            {BD_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className={styles.selectField} value={deliveryArea} onChange={e => setDeliveryArea(e.target.value)}>
            <option value="">Select Delivery Area *</option>
            {DELIVERY_AREAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>

          <textarea className={styles.textareaField} placeholder="Delivery Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
          {error && <p className={styles.errorText}>{error}</p>}
        </section>

        {/* Order Summary */}
        <aside className={styles.orderSummarySection}>
          <div className={styles.orderSummaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <ul className={styles.itemsList}>
              {items.map(item => (
                <li key={item.variant_id} className={styles.summaryItem}>
                  <span className={styles.itemName}>{item.product_name} ({item.variant_label}) × {item.quantity}</span>
                  <span className={styles.itemPrice}>৳ {item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            <div className={styles.summaryLine}>
              <span className={styles.lineLabel}>Delivery:</span>
              <span className={styles.lineValue}>৳ {deliveryCharge}</span>
            </div>

            <div className={styles.summaryTotal}>
              <span className={styles.totalLabel}>Total:</span>
              <span className={styles.totalValue}>৳ {backendTotal ?? cartTotal + deliveryCharge}</span>
            </div>

            <button className={styles.placeOrderButton} disabled={state === "submitting"} onClick={handlePlaceOrder}>
              {state === "submitting" ? "Placing Order…" : "Place Order"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
