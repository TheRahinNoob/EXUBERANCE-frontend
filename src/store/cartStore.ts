import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ==================================================
   TYPES
================================================== */
export type CartItem = {
  variant_id: number;
  product_id: number;
  product_slug: string;
  product_name: string;
  image: string;
  price: number;
  quantity: number;
  variant_label: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variant_id: number) => void;
  updateQuantity: (variant_id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

/* ==================================================
   HELPER: Reset AddToCart deduplication
================================================== */
const resetAddToCartDeduplication = () => {
  if (typeof window === "undefined") return;
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith("addToCartFired-"))
      .forEach((key) => sessionStorage.removeItem(key));
    console.log("[Meta Pixel] AddToCart deduplication reset");
  } catch (err) {
    console.error("[Meta Pixel] Failed to reset AddToCart deduplication", err);
  }
};

/* ==================================================
   STORE
================================================== */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variant_id === item.variant_id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (variant_id) => {
        set((state) => ({
          items: state.items.filter((item) => item.variant_id !== variant_id),
        }));
      },

      updateQuantity: (variant_id, quantity) => {
        if (quantity <= 0) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.variant_id === variant_id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
        resetAddToCartDeduplication();
      },

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage",
      skipHydration: true,
      version: 3, // version bump
      migrate: (persistedState, version) => {
        console.log("[CartStore] migrate called", version, persistedState);
        // Return persisted state if exists, otherwise default
        return persistedState ?? { items: [] };
      },
    }
  )
);
