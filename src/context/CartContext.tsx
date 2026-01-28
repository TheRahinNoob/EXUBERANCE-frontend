"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/* -----------------------------
   Types
------------------------------ */
export type CartItem = {
  productId: number;
  variantId: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: number) => void;
  clearCart: () => void;
  totalItems: number;
};

/* -----------------------------
   Context
------------------------------ */
const CartContext = createContext<CartContextType | null>(null);

/* -----------------------------
   Provider
------------------------------ */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  /* -----------------------------
     LOAD CART FROM localStorage
  ------------------------------ */
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);

  /* -----------------------------
     SAVE CART TO localStorage
  ------------------------------ */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /* -----------------------------
     ADD TO CART (MERGE BY VARIANT)
  ------------------------------ */
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) => p.variantId === item.variantId
      );

      if (existing) {
        const newQty = existing.quantity + item.quantity;

        if (newQty <= 0) {
          return prev.filter(
            (p) => p.variantId !== item.variantId
          );
        }

        return prev.map((p) =>
          p.variantId === item.variantId
            ? { ...p, quantity: newQty }
            : p
        );
      }

      if (item.quantity <= 0) return prev;

      return [...prev, item];
    });
  };

  /* -----------------------------
     REMOVE ITEM
  ------------------------------ */
  const removeFromCart = (variantId: number) => {
    setCart((prev) =>
      prev.filter((item) => item.variantId !== variantId)
    );
  };

  /* -----------------------------
     CLEAR CART
  ------------------------------ */
  const clearCart = () => {
    setCart([]);
  };

  /* -----------------------------
     TOTAL ITEM COUNT (NAVBAR)
  ------------------------------ */
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* -----------------------------
   Hook
------------------------------ */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }
  return ctx;
}
