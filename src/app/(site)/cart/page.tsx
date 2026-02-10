"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CartPage.module.css";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  /* =========================
     RELATED PRODUCTS STATE
  ========================= */
  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

  /* =========================
     FETCH RELATED PRODUCTS
     (based on first cart item)
  ========================= */
  useEffect(() => {
    if (items.length === 0) return;

    const slug = items[0].product_slug;

    fetch(`/api/cart/related?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setRelatedProducts(
          Array.isArray(data) ? data : []
        );
      })
      .catch(() => setRelatedProducts([]));
  }, [items]);

  /* =========================
     EMPTY STATE
  ========================= */
  if (items.length === 0) {
    return (
      <main className={styles.empty}>
        <h1 className={styles.emptyTitle}>
          Your cart is currently empty
        </h1>

        <p className={styles.emptyText}>
          Looks like you haven’t added any products yet.
          Start exploring and find something you’ll love.
        </p>

        <Link href="/" className={styles.primaryBtn}>
          Continue Shopping
        </Link>
      </main>
    );
  }

  /* =========================
     FIRE INITIATE CHECKOUT EVENT
  ========================= */
  const handleInitiateCheckout = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      try {
        (window as any).fbq("track", "InitiateCheckout", {
          value: totalPrice,
          currency: "BDT",
          content_ids: items.map((i) => i.variant_id),
          content_type: "product",
        });
      } catch (err) {
        console.warn("fbq InitiateCheckout error:", err);
      }
    }
  };

  /* =========================
     CART PAGE
  ========================= */
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Your Cart</h1>

      {/* HEADER */}
      <div className={styles.headerRow}>
        <span>Product</span>
        <span>Unit Price</span>
        <span>Size</span>
        <span>Quantity</span>
        <span>Subtotal</span>
        <span>Action</span>
      </div>

      {/* ITEMS */}
      {items.map((item) => (
        <div key={item.variant_id} className={styles.row}>
          {/* PRODUCT */}
          <div className={styles.product}>
            <img
              src={item.image}
              alt={item.product_name}
              loading="lazy"
            />

            <Link
              href={`/products/${item.product_slug}`}
              className={styles.productName}
            >
              {item.product_name}
            </Link>
          </div>

          {/* UNIT PRICE */}
          <div>৳ {item.price}</div>

          {/* SIZE */}
          <div className={styles.size}>
            {item.variant_label}
          </div>

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

          {/* SUBTOTAL */}
          <div>
            ৳ {item.price * item.quantity}
          </div>

          {/* ACTION */}
          <button
            className={styles.remove}
            onClick={() =>
              removeItem(item.variant_id)
            }
            aria-label={`Remove ${item.product_name}`}
          >
            🗑
          </button>
        </div>
      ))}

      {/* TOTAL */}
      <div className={styles.totalBox}>
        <span>Total Amount (৳):</span>
        <strong>{totalPrice}</strong>
      </div>

      {/* ACTION BUTTONS */}
      <div className={styles.actions}>
        <Link
          href="/checkout"
          className={styles.primaryBtn}
          onClick={handleInitiateCheckout} // 🔥 InitiateCheckout fired here
        >
          Place Order
        </Link>

        <Link
          href="/"
          className={styles.secondaryBtn}
        >
          Continue Shopping
        </Link>
      </div>

      {/* =========================
         RELATED PRODUCTS
      ========================= */}
      {relatedProducts.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>
            You may also like
          </h2>

          <div className={styles.relatedGrid}>
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className={styles.productCard}
              >
                {/* IMAGE */}
                <div className={styles.cardImageWrap}>
                  <img
                    src={item.main_image}
                    alt={item.name}
                    loading="lazy"
                  />
                </div>

                {/* INFO */}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>
                    {item.name}
                  </h3>

                  <div className={styles.cardSub}>
                    Starts from
                  </div>

                  <div className={styles.cardPrice}>
                    ৳ {item.price}
                  </div>
                </div>

                {/* FOOTER */}
                <div className={styles.cardFooter}>
                  <span>♡ Save</span>
                  <span>↗ Share</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
