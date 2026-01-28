"use client";

import { CartItem, useCartStore } from "@/store/cartStore";
import styles from "./CartItemRow.module.css";

export default function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore(
    (state) => state.updateQuantity
  );
  const removeItem = useCartStore(
    (state) => state.removeItem
  );

  return (
    <div className={styles.row}>
      {/* IMAGE */}
      <img
        src={item.image}
        alt={item.product_name}
        className={styles.image}
      />

      {/* INFO */}
      <div className={styles.info}>
        <h3>{item.product_name}</h3>
        <p className={styles.variant}>{item.variant_label}</p>

        <p className={styles.price}>
          ৳ {item.price}
        </p>
      </div>

      {/* QUANTITY */}
      <div className={styles.qty}>
        <button
          onClick={() =>
            updateQuantity(
              item.variant_id,
              item.quantity - 1
            )
          }
          disabled={item.quantity <= 1}
        >
          −
        </button>

        <span>{item.quantity}</span>

        <button
          onClick={() =>
            updateQuantity(
              item.variant_id,
              item.quantity + 1
            )
          }
        >
          +
        </button>
      </div>

      {/* REMOVE */}
      <button
        className={styles.remove}
        onClick={() =>
          removeItem(item.variant_id)
        }
      >
        ✕
      </button>
    </div>
  );
}
