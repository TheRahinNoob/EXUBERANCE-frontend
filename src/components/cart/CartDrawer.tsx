"use client";

import Link from "next/link";
import styles from "./CartDrawer.module.css";

import { useUIStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";

/* ==================================================
   CART DRAWER (SHOP)
   - Slide-in panel
   - UI-only (state via Zustand)
================================================== */
export default function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore();

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  /* -----------------------------
     VISIBILITY
  ------------------------------ */
  if (!isCartOpen) return null;

  /* -----------------------------
     RENDER
  ------------------------------ */
  return (
    <>
      {/* ================= BACKDROP ================= */}
      <div
        className={styles.backdrop}
        onClick={closeCart}
      />

      {/* ================= DRAWER ================= */}
      <aside
        className={styles.drawer}
        aria-label="Shopping cart"
      >
        {/* ================= HEADER ================= */}
        <header className={styles.header}>
          <h3>Your Cart</h3>

          <button
            onClick={closeCart}
            aria-label="Close cart"
            className={styles.closeBtn}
          >
            ✕
          </button>
        </header>

        {/* ================= BODY ================= */}
        <section className={styles.body}>
          {items.length === 0 && (
            <div className={styles.empty}>
              <p>Your cart is empty</p>

              <Link
                href="/shop"
                onClick={closeCart}
                className={styles.continue}
              >
                Continue shopping
              </Link>
            </div>
          )}

          {items.map((item) => (
            <article
              key={item.variant_id}
              className={styles.item}
            >
              {/* IMAGE */}
              <img
                src={item.image}
                alt={item.product_name}
                loading="lazy"
                className={styles.image}
              />

              {/* INFO */}
              <div className={styles.info}>
                <Link
                  href={`/products/${item.product_slug}`}
                  onClick={closeCart}
                  className={styles.name}
                >
                  {item.product_name}
                </Link>

                <div className={styles.variant}>
                  {item.variant_label}
                </div>

                <div className={styles.row}>
                  <span className={styles.price}>
                    ৳ {item.price}
                  </span>

                  {/* QUANTITY */}
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.variant_id,
                        Number(e.target.value)
                      )
                    }
                    className={styles.qty}
                  />
                </div>
              </div>

              {/* REMOVE */}
              <button
                className={styles.remove}
                onClick={() =>
                  removeItem(item.variant_id)
                }
                aria-label={`Remove ${item.product_name}`}
              >
                🗑
              </button>
            </article>
          ))}
        </section>

        {/* ================= FOOTER ================= */}
        {items.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.total}>
              <span>Total</span>
              <strong>৳ {totalPrice}</strong>
            </div>

            <div className={styles.actions}>
              <Link
                href="/cart"
                onClick={closeCart}
                className={styles.viewCart}
              >
                View Cart
              </Link>

              <Link
                href="/checkout"
                onClick={closeCart}
                className={styles.checkout}
              >
                Checkout
              </Link>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}
