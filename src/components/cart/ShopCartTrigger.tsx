"use client";

import styles from "./ShopCartTrigger.module.css";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";

/* ==================================================
   SHOP CART TRIGGER
   - Visible ONLY inside /shop layout
   - Opens CartDrawer
================================================== */
export default function ShopCartTrigger() {
  const totalItems = useCartStore((state) =>
    state.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
  );

  const openCart = useUIStore((s) => s.openCart);

  // Hide trigger when cart is empty
  if (totalItems === 0) return null;

  return (
    <button
      className={styles.trigger}
      onClick={openCart}
      aria-label="Open cart"
    >
      <i className="fa fa-shopping-cart" />

      <span className={styles.badge}>
        {totalItems}
      </span>
    </button>
  );
}
