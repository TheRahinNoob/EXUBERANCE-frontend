import { create } from "zustand";

/* ==================================================
   UI STORE
   - UI state only (NO business logic)
   - Global, lightweight
   - Safe for App Router
================================================== */

type UIState = {
  /* -----------------------------
     CART DRAWER
  ------------------------------ */
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  /* -----------------------------
     ADD TO CART MODAL
  ------------------------------ */
  addToCartProductSlug: string | null;
  openAddToCartModal: (slug: string) => void;
  closeAddToCartModal: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  /* -----------------------------
     CART DRAWER
  ------------------------------ */
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  /* -----------------------------
     ADD TO CART MODAL
  ------------------------------ */
  addToCartProductSlug: null,
  openAddToCartModal: (slug) =>
    set({ addToCartProductSlug: slug }),
  closeAddToCartModal: () =>
    set({ addToCartProductSlug: null }),
}));
