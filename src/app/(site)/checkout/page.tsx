"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import styles from "./CheckoutPage.module.css";

type CheckoutItemPayload = { variant_id: number; quantity: number };
type OrderSuccessResponse = { reference: string; status: string; total_price: number };
type CheckoutState = "idle" | "submitting" | "failed";
type Step = 0 | 1 | 2;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const BD_CITIES = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Narayanganj",
  "Gazipur",
  "Bogura",
  "Jessore",
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

  // Inputs (simplified: removed alt phone + note)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");

  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [backendTotal, setBackendTotal] = useState<number | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);

  // Mobile flow state
  const [isMobile, setIsMobile] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Auto delivery area based on city
  useEffect(() => {
    if (!city) return;
    const autoArea = city === "Dhaka" ? "inside_dhaka" : "outside_dhaka";
    setDeliveryArea(autoArea);
  }, [city]);

  // Delivery charge
  useEffect(() => {
    const selected = DELIVERY_AREAS.find((d) => d.value === deliveryArea);
    setDeliveryCharge(selected?.charge || 0);
  }, [deliveryArea]);

  const computedTotal = useMemo(
    () => backendTotal ?? cartTotal + deliveryCharge,
    [backendTotal, cartTotal, deliveryCharge]
  );

  const requiredContactOk = useMemo(() => {
    return Boolean(fullName.trim() && phone.trim());
  }, [fullName, phone]);

  const requiredDeliveryOk = useMemo(() => {
    return Boolean(address.trim() && city && deliveryArea);
  }, [address, city, deliveryArea]);

  const validateForStep = (s: Step): boolean => {
    setError(null);

    if (s === 0) {
      if (!requiredContactOk) {
        setError("Name and phone number are required.");
        return false;
      }
      // super common BD check: phone must be at least 11 digits (still soft)
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10) {
        setError("Please enter a valid phone number.");
        return false;
      }
      return true;
    }

    if (s === 1) {
      if (!requiredDeliveryOk) {
        setError("Please enter address, city, and delivery area.");
        return false;
      }
      return true;
    }

    if (!requiredContactOk || !requiredDeliveryOk) {
      setError("Please complete all required fields.");
      return false;
    }
    return true;
  };

  // Empty cart guard
  if (!items.length) {
    return (
      <main className={styles.emptyCart}>
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <Link href="/" className={styles.backLink}>
          Return to shop
        </Link>
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    if (state === "submitting") return;
    if (!validateForStep(2)) return;

    setState("submitting");
    setError(null);

    try {
      const payload = {
        name: fullName,
        phone,
        email,
        address,
        city,
        delivery_area: deliveryArea,
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

      const data: OrderSuccessResponse = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));

      setBackendTotal(data.total_price);

      clearCart();
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("addToCartFired-"))
        .forEach((k) => sessionStorage.removeItem(k));

      router.replace(`/order-success?ref=${data.reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed.");
      setState("failed");
    }
  };

  const nextFromStep0 = () => {
    if (!validateForStep(0)) return;
    setStep(1);
  };

  const nextFromStep1 = () => {
    if (!validateForStep(1)) return;
    setStep(2);
  };

  const back = () => setStep((s) => (s === 0 ? 0 : ((s - 1) as Step)));

  // --- Panels ---
  const ContactPanel = (
    <section className={styles.customerSection} aria-label="Contact information">
      <h2 className={styles.sectionTitle}>1) Contact</h2>
      <p className={styles.helperText}>Enter your details so we can call you if needed.</p>

      <input
        className={styles.inputField}
        placeholder="Full Name *"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        autoComplete="name"
      />

      <input
        className={styles.inputField}
        placeholder="Phone Number * (e.g. 01XXXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
        inputMode="tel"
      />

      <input
        className={styles.inputField}
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        inputMode="email"
      />

      {error && <p className={styles.errorText}>{error}</p>}
    </section>
  );

  const DeliveryPanel = (
    <section className={styles.customerSection} aria-label="Delivery information">
      <h2 className={styles.sectionTitle}>2) Delivery</h2>
      <p className={styles.helperText}>Where should we deliver your order?</p>

      <textarea
        className={styles.textareaField}
        placeholder="Full Address * (House, Road, Area)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        rows={3}
      />

      <select className={styles.selectField} value={city} onChange={(e) => setCity(e.target.value)}>
        <option value="">Select City / District *</option>
        {BD_CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className={styles.deliveryAreaCard}>
        <div className={styles.deliveryAreaTitle}>Delivery Area *</div>

        <label className={styles.radioRow}>
          <input
            type="radio"
            name="deliveryArea"
            value="inside_dhaka"
            checked={deliveryArea === "inside_dhaka"}
            onChange={(e) => setDeliveryArea(e.target.value)}
          />
          <span>Inside Dhaka</span>
          <span className={styles.radioPrice}>৳80</span>
        </label>

        <label className={styles.radioRow}>
          <input
            type="radio"
            name="deliveryArea"
            value="outside_dhaka"
            checked={deliveryArea === "outside_dhaka"}
            onChange={(e) => setDeliveryArea(e.target.value)}
          />
          <span>Outside Dhaka</span>
          <span className={styles.radioPrice}>৳150</span>
        </label>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </section>
  );

  const ConfirmPanel = (
    <section className={styles.customerSection} aria-label="Confirm order">
      <h2 className={styles.sectionTitle}>3) Confirm</h2>
      <p className={styles.helperText}>Check details and confirm your order.</p>

      <div className={styles.confirmCard}>
        <div className={styles.confirmRow}>
          <div className={styles.confirmLabel}>Name</div>
          <div className={styles.confirmValue}>{fullName || "—"}</div>
        </div>

        <div className={styles.confirmRow}>
          <div className={styles.confirmLabel}>Phone</div>
          <div className={styles.confirmValue}>{phone || "—"}</div>
        </div>

        <div className={styles.confirmRow}>
          <div className={styles.confirmLabel}>Address</div>
          <div className={styles.confirmValue} title={address || ""}>
            {address || "—"}
          </div>
        </div>

        <div className={styles.confirmRow}>
          <div className={styles.confirmLabel}>City</div>
          <div className={styles.confirmValue}>{city || "—"}</div>
        </div>

        <div className={styles.confirmRow}>
          <div className={styles.confirmLabel}>Delivery</div>
          <div className={styles.confirmValue}>৳ {deliveryCharge}</div>
        </div>

        <button type="button" className={styles.summaryOpenButton} onClick={() => setSummaryOpen(true)}>
          Review Order Items
        </button>

        <div className={styles.trustNote}>
          ✅ After you confirm, we will call you to verify your order (if needed).
        </div>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </section>
  );

  // Desktop: keep your old layout (but remove fields)
  const DesktopLayout = (
    <div className={styles.checkoutContainer}>
      <section className={styles.customerSection}>
        <h2 className={styles.sectionTitle}>Customer Information</h2>

        <input className={styles.inputField} placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className={styles.inputField} placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className={styles.inputField} placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />

        <textarea className={styles.textareaField} placeholder="Full Address *" value={address} onChange={(e) => setAddress(e.target.value)} />

        <select className={styles.selectField} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Select City / District *</option>
          {BD_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select className={styles.selectField} value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value)}>
          <option value="">Select Delivery Area *</option>
          {DELIVERY_AREAS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {error && <p className={styles.errorText}>{error}</p>}
      </section>

      <aside className={styles.orderSummarySection}>
        <div className={styles.orderSummaryCard}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          <ul className={styles.itemsList}>
            {items.map((item) => (
              <li key={item.variant_id} className={styles.summaryItem}>
                <span className={styles.itemName}>
                  {item.product_name} ({item.variant_label}) × {item.quantity}
                </span>
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
            <span className={styles.totalValue}>৳ {computedTotal}</span>
          </div>

          <button className={styles.placeOrderButton} disabled={state === "submitting"} onClick={handlePlaceOrder}>
            {state === "submitting" ? "Placing Order…" : "Checkout"}
          </button>
        </div>
      </aside>
    </div>
  );

  // Mobile: familiar “stepper + big bottom CTA”
  const MobileWizard = (
    <div className={styles.mobileShell}>
      <div className={styles.mobileTopBar}>
        <div className={styles.stepHeader}>
          <div className={styles.stepTitle}>
            {step === 0 ? "Contact" : step === 1 ? "Delivery" : "Confirm"}
          </div>
          <div className={styles.stepSubTitle}>Step {step + 1} of 3</div>
        </div>

        <button type="button" className={styles.summaryBtn} onClick={() => setSummaryOpen(true)}>
          Items
        </button>
      </div>

      <div className={styles.panelArea} aria-live="polite">
        {step === 0 && ContactPanel}
        {step === 1 && DeliveryPanel}
        {step === 2 && ConfirmPanel}
      </div>

      <div className={styles.stickyBar} role="region" aria-label="Checkout action bar">
        <div className={styles.totalBox}>
          <div className={styles.totalMiniLabel}>Total</div>
          <div className={styles.totalMiniValue}>৳ {computedTotal}</div>
        </div>

        <div className={styles.actions}>
          {step > 0 && (
            <button type="button" className={styles.secondaryAction} onClick={back} disabled={state === "submitting"}>
              Back
            </button>
          )}

          {step === 0 && (
            <button type="button" className={styles.primaryAction} onClick={nextFromStep0} disabled={state === "submitting"}>
              Continue
            </button>
          )}

          {step === 1 && (
            <button type="button" className={styles.primaryAction} onClick={nextFromStep1} disabled={state === "submitting"}>
              Continue
            </button>
          )}

          {step === 2 && (
            <button type="button" className={styles.primaryAction} onClick={handlePlaceOrder} disabled={state === "submitting"}>
              {state === "submitting" ? "Placing…" : "Confirm Order"}
            </button>
          )}
        </div>
      </div>

      {summaryOpen && (
        <div className={styles.drawerOverlay} role="dialog" aria-modal="true" aria-label="Order items" onClick={() => setSummaryOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>Your Items</div>
              <button type="button" className={styles.closeBtn} onClick={() => setSummaryOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className={styles.drawerBody}>
              <ul className={styles.drawerList}>
                {items.map((item) => (
                  <li key={item.variant_id} className={styles.drawerItem}>
                    <div className={styles.drawerLeft}>
                      <div className={styles.drawerName}>
                        {item.product_name} ({item.variant_label})
                      </div>
                      <div className={styles.drawerMeta}>Qty: {item.quantity}</div>
                    </div>
                    <div className={styles.drawerRight}>৳ {item.price * item.quantity}</div>
                  </li>
                ))}
              </ul>

              <div className={styles.drawerLine}>
                <span>Subtotal</span>
                <span>৳ {cartTotal}</span>
              </div>
              <div className={styles.drawerLine}>
                <span>Delivery</span>
                <span>৳ {deliveryCharge}</span>
              </div>
              <div className={styles.drawerTotal}>
                <span>Total</span>
                <span>৳ {computedTotal}</span>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button type="button" className={styles.primaryWide} onClick={() => setSummaryOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className={styles.checkoutPage}>
      <h1 className={styles.pageTitle}>Checkout</h1>
      {isMobile ? MobileWizard : DesktopLayout}
    </main>
  );
}