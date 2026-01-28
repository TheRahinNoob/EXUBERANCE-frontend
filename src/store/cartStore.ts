import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ==================================================
   TYPES
================================================== */
export type CartItem = {
  variant_id: number;
  product_id: number;
  product_slug: string;      // ✅ REQUIRED for product link
  product_name: string;
  image: string;
  price: number;
  quantity: number;
  variant_label: string;
};

type CartState = {
  /* -----------------------------
     STATE
  ------------------------------ */
  items: CartItem[];

  /* -----------------------------
     ACTIONS
  ------------------------------ */
  addItem: (item: CartItem) => void;
  removeItem: (variant_id: number) => void;
  updateQuantity: (variant_id: number, quantity: number) => void;
  clearCart: () => void;

  /* -----------------------------
     DERIVED (SYNC, FAST)
  ------------------------------ */
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

/* ==================================================
   STORE
   - App Router safe
   - Persisted
   - Hydration controlled manually
================================================== */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      /* -----------------------------
         INITIAL STATE
      ------------------------------ */
      items: [],

      /* -----------------------------
         ADD ITEM
         - Merges by variant_id
         - Increments quantity safely
      ------------------------------ */
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variant_id === item.variant_id
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                    }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, item],
          };
        });
      },

      /* -----------------------------
         REMOVE ITEM
      ------------------------------ */
      removeItem: (variant_id) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.variant_id !== variant_id
          ),
        }));
      },

      /* -----------------------------
         UPDATE QUANTITY
         - Guards against invalid values
      ------------------------------ */
      updateQuantity: (variant_id, quantity) => {
        if (quantity <= 0) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.variant_id === variant_id
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      /* -----------------------------
         CLEAR CART
      ------------------------------ */
      clearCart: () => {
        set({ items: [] });
      },

      /* -----------------------------
         DERIVED VALUES
         - Computed on demand
         - No extra renders
      ------------------------------ */
      getTotalItems: () =>
        get().items.reduce(
          (total, item) => total + item.quantity,
          0
        ),

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) =>
            total + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "cart-storage",
      skipHydration: true, // ✅ correct for App Router
      version: 2,         // 🔥 bumped because CartItem shape changed
    }
  )
);
