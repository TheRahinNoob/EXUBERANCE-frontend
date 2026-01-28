"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import styles from "./CartSummary.module.css";

export default function CartSummary() {
  const totalItems = useCartStore(
    (state) => state.getTotalItems()
  );
  const totalPrice = useCartStore(
    (state) => state.getTotalPrice()
  );

  return (
    <aside className={styles.summary}>
      <h2>Order Summary</h2>

      <div className={styles.row}>
        <span>Items</span>
        <span>{totalItems}</span>
      </div>

      <div className={styles.row}>
        <span>Total</span>
        <strong>৳ {totalPrice}</strong>
      </div>

      <Link href="/checkout" className={styles.checkout}>
        Proceed to Checkout
      </Link>
    </aside>
  );
}
