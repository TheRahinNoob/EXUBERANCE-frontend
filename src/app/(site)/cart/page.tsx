"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./CartPage.module.css";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (items.length === 0) {
      setRelatedProducts([]);
      return;
    }

    const slug = items[0].product_slug;

    fetch(`/api/cart/related?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setRelatedProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setRelatedProducts([]));
  }, [items]);

  const toNumber = (value: string | number | null | undefined): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatPrice = (value: string | number | null | undefined): string => {
    return new Intl.NumberFormat("en-BD").format(toNumber(value));
  };

  const cartTotal = toNumber(totalPrice);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const handleInitiateCheckout = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      try {
        (window as any).fbq("track", "InitiateCheckout", {
          value: cartTotal,
          currency: "BDT",
          content_ids: items.map((i) => i.variant_id),
          content_type: "product",
        });
      } catch (err) {
        console.warn("fbq InitiateCheckout error:", err);
      }
    }
  };

  const handleDecrease = (variantId: number, quantity: number) => {
    if (quantity <= 1) return;
    updateQuantity(variantId, quantity - 1);
  };

  const handleIncrease = (variantId: number, quantity: number) => {
    updateQuantity(variantId, quantity + 1);
  };

  if (items.length === 0) {
    return (
      <main className={styles.emptyPage}>
        <section className={styles.emptyCard}>
          <div className={styles.emptyIcon}>🛍️</div>
          <span className={styles.emptyEyebrow}>Your bag is empty</span>
          <h1 className={styles.emptyTitle}>Nothing in your cart yet</h1>
          <p className={styles.emptyText}>
            Start exploring the collection and add the products you love.
          </p>

          <div className={styles.emptyActions}>
            <Link href="/" className={styles.primaryBtn}>
              Continue Shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* TOP OVERVIEW */}
      <section className={styles.topSection}>
        <div className={styles.headingBlock}>
          <span className={styles.eyebrow}>Shopping Cart</span>
          <h1 className={styles.pageTitle}>Review your order</h1>
          <p className={styles.pageText}>
            A clean and fast checkout experience designed for mobile first.
          </p>
        </div>

        <div className={styles.topStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Items</span>
            <strong className={styles.statValue}>{totalItems}</strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total</span>
            <strong className={styles.statValue}>৳ {formatPrice(cartTotal)}</strong>
          </div>
        </div>
      </section>

      <section className={styles.layout}>
        {/* MOBILE-FIRST SUMMARY FIRST / DESKTOP SIDEBAR */}
        <aside className={styles.summaryColumn}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <p className={styles.summaryText}>
                Clear totals before the final step.
              </p>
            </div>

            <div className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <span>Products</span>
                <span>{items.length}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Total items</span>
                <span>{totalItems}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>৳ {formatPrice(cartTotal)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>At checkout</span>
              </div>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <strong>৳ {formatPrice(cartTotal)}</strong>
            </div>

            <div className={styles.summaryActions}>
              <Link
                href="/checkout"
                className={styles.primaryBtn}
                onClick={handleInitiateCheckout}
              >
                Place Order
              </Link>

              <Link href="/" className={styles.secondaryBtn}>
                Continue Shopping
              </Link>
            </div>

            <div className={styles.supportNote}>
              Fast cart editing, clean checkout flow, mobile-optimized experience.
            </div>
          </div>
        </aside>

        {/* ITEMS */}
        <section className={styles.itemsColumn}>
          <div className={styles.itemsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Cart Items</h2>
              <p className={styles.sectionText}>
                Update quantity, remove products, and confirm your choices.
              </p>
            </div>

            <Link href="/" className={styles.inlineLink}>
              Add more
            </Link>
          </div>

          <div className={styles.itemsList}>
            {items.map((item) => {
              const unitPrice = toNumber(item.price);
              const subtotal = unitPrice * item.quantity;

              return (
                <article key={item.variant_id} className={styles.itemCard}>
                  <Link
                    href={`/products/${item.product_slug}`}
                    className={styles.imageWrap}
                    aria-label={item.product_name}
                  >
                    <img
                      src={item.image}
                      alt={item.product_name}
                      loading="lazy"
                      className={styles.productImage}
                    />
                  </Link>

                  <div className={styles.itemContent}>
                    <div className={styles.itemTop}>
                      <div className={styles.itemInfo}>
                        <Link
                          href={`/products/${item.product_slug}`}
                          className={styles.productName}
                        >
                          {item.product_name}
                        </Link>

                        <div className={styles.metaWrap}>
                          <span className={styles.metaBadge}>
                            Size: {item.variant_label}
                          </span>
                          <span className={styles.metaBadge}>
                            Unit: ৳ {formatPrice(unitPrice)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.variant_id)}
                        aria-label={`Remove ${item.product_name}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className={styles.itemBottom}>
                      <div className={styles.qtyArea}>
                        <span className={styles.smallLabel}>Quantity</span>

                        <div className={styles.qtyControl}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() =>
                              handleDecrease(item.variant_id, item.quantity)
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.product_name}`}
                          >
                            −
                          </button>

                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.variant_id,
                                Math.max(1, Number(e.target.value) || 1)
                              )
                            }
                            className={styles.qtyInput}
                            aria-label={`Quantity of ${item.product_name}`}
                          />

                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() =>
                              handleIncrease(item.variant_id, item.quantity)
                            }
                            aria-label={`Increase quantity of ${item.product_name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className={styles.subtotalArea}>
                        <span className={styles.smallLabel}>Subtotal</span>
                        <strong className={styles.subtotalPrice}>
                          ৳ {formatPrice(subtotal)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      {/* RELATED PRODUCTS LAST */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <span className={styles.relatedEyebrow}>Recommended</span>
            <h2 className={styles.relatedTitle}>You may also like</h2>
          </div>

          <div className={styles.relatedGrid}>
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedImageWrap}>
                  <img
                    src={item.main_image}
                    alt={item.name}
                    loading="lazy"
                    className={styles.relatedImage}
                  />
                </div>

                <div className={styles.relatedBody}>
                  <h3 className={styles.relatedProductTitle}>{item.name}</h3>
                  <span className={styles.relatedSub}>Starts from</span>
                  <strong className={styles.relatedPrice}>
                    ৳ {formatPrice(item.price)}
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
